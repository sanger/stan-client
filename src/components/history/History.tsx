import React from 'react';
import createHistoryMachine from './history.machine';
import { useMachine } from '@xstate/react';
import DataTable from '../DataTable';
import { CellProps, Column } from 'react-table';
import { HistoryTableEntry } from '../../types/stan';
import StyledLink from '../StyledLink';
import Warning from '../notifications/Warning';
import WhiteButton from '../buttons/WhiteButton';
import LoadingSpinner from '../icons/LoadingSpinner';
import { LabwareStatePill } from '../LabwareStatePill';
import DownloadIcon from '../icons/DownloadIcon';
import { getTimestampStr, stringify } from '../../lib/helpers';
import { ExcelFileType, GraphFileType, useDownload } from '../../lib/hooks/useDownload';
import Heading from '../Heading';
import Table, { TableBody, TableCell } from '../Table';
import { useAuth } from '../../context/AuthContext';
import TopScrollingBar from '../TopScrollingBar';
import { HistoryUrlParams } from '../../pages/History';
import { ZoomInIcon } from '../icons/ZoomInIcon';
import { ZoomOutIcon } from '../icons/ZoomOutIcon';
import { FontSizeIcon } from '../icons/FontSizeIcon';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { omit } from 'lodash';
import BlueButton from '../buttons/BlueButton';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';

/**
 * Component for looking up and displaying the history of labware and samples
 */
type HistoryProps = HistoryUrlParams & { displayFlaggedLabware?: boolean };
export default function History(props: HistoryProps) {
  const getHistoryURLParams = (props: HistoryProps): HistoryUrlParams => {
    const { displayFlaggedLabware, ...urlProps } = props;
    return urlProps;
  };
  const historyMachine = React.useMemo(() => {
    return createHistoryMachine();
  }, []);
  const [current, send] = useMachine(historyMachine, {
    input: {
      historyProps: getHistoryURLParams(props),
      history: { entries: [], flaggedBarcodes: [] },
      serverError: null,
      historyGraph: undefined,
      historyGraphZoom: 1,
      historyGraphFontSize: 16
    }
  });

  const { isAuthenticated } = useAuth();

  const { history, historyProps, serverError, historyGraph, historyGraphZoom, historyGraphFontSize } = current.context;
  const historyColumns: Array<Column<HistoryTableEntry>> = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date'
      },
      {
        Header: 'Event Type',
        accessor: 'eventType'
      },
      {
        Header: 'Work number',
        accessor: 'workNumber'
      },
      {
        Header: 'User',
        accessor: 'username'
      },
      {
        Header: 'Source',
        accessor: 'sourceBarcode',
        Cell: (props: CellProps<HistoryTableEntry>) => {
          const barcode = props.row.original.sourceBarcode;
          let classes =
            historyProps.barcode === barcode
              ? 'bg-yellow-400 text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide'
              : '';
          return (
            <StyledLink
              data-testid={'source-barcode-link'}
              to={`/labware/${barcode}`}
              className={classes ? classes : undefined}
            >
              {barcode}
            </StyledLink>
          );
        }
      },
      {
        Header: 'Destination',
        accessor: 'destinationBarcode',
        Cell: (props: CellProps<HistoryTableEntry>) => {
          const barcode = props.row.original.destinationBarcode;
          let classes =
            historyProps.barcode === barcode
              ? 'bg-yellow-400 text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide'
              : '';
          return (
            <StyledLink
              data-testid="destination-barcode-link"
              to={`/labware/${barcode}`}
              className={classes ? classes : undefined}
            >
              {barcode}
            </StyledLink>
          );
        }
      },
      {
        Header: 'Labware Type',
        accessor: 'labwareType'
      },
      {
        Header: 'Donor ID',
        accessor: 'donorName'
      },
      {
        Header: 'External ID',
        accessor: 'externalName'
      },
      {
        Header: 'Section Number',
        accessor: 'sectionNumber'
      },
      {
        Header: 'Address',
        accessor: 'address'
      },
      {
        Header: 'Section Position',
        accessor: 'sectionPosition'
      },
      {
        Header: 'Biological State',
        accessor: 'biologicalState'
      },
      {
        Header: 'Labware State',
        accessor: 'labwareState',
        Cell: (props: CellProps<HistoryTableEntry>) => (
          <LabwareStatePill labware={{ state: props.row.original.labwareState }} />
        )
      },
      {
        Header: 'Details',
        accessor: 'details',
        Cell: (props: CellProps<HistoryTableEntry>) => {
          const details = props.row.original.details.map((detail) => {
            return <li key={detail}>{detail}</li>;
          });
          if (props.row.original.eventType?.toLowerCase() === 'release') {
            const releaseId = props.row.original.eventId;
            details.push(
              <li key={releaseId}>
                <StyledLink data-testid="release-options-link" to={`/releaseOptions?id=${releaseId}`} target={'_blank'}>
                  <BlueButton action="tertiary">Release Options </BlueButton>
                </StyledLink>
              </li>
            );
          }
          return <ul>{details}</ul>;
        }
      }
    ],
    [historyProps]
  );

  /**
   * Rebuild the file object whenever the history changes
   */
  const downloadData = React.useMemo(() => {
    if (historyProps.resultFormat === 'graph') {
      return {
        graph: historyGraph,
        fileType: GraphFileType
      };
    }
    return {
      columnData: {
        columns: historyColumns
      },
      entries: history.entries,
      fileType: ExcelFileType
    };
  }, [history, historyColumns, historyGraph, historyProps]);

  const { downloadURL, extension } = useDownload(downloadData);

  const uniqueWorkNumbers = React.useMemo(() => {
    const uniqueWorkNumbers = [...new Set(history.entries.map((item) => item.workNumber))];
    const workNumbers: string[] = [];
    uniqueWorkNumbers.forEach((wrkNumber) => {
      if (wrkNumber && wrkNumber.length > 0) {
        workNumbers.push(wrkNumber);
      }
    });
    return workNumbers;
  }, [history]);

  const isValidInput = props.sampleId || props.workNumber || props.barcode || props.externalName || props.donorName;

  /**
   * If the props change, send an update event to the machine
   */
  React.useEffect(() => {
    send({ type: 'UPDATE_HISTORY_PROPS', props: getHistoryURLParams(props) });
  }, [props, send, isValidInput]);

  /**
   * File upload option is only for authenticated users, so
   * only allow permission to view or download uploaded files if not authenticated
   */
  const fileUploadUrlPath = (workNumber: string) => {
    const queryParamsStr = stringify({
      workNumber: workNumber
    });
    return isAuthenticated() ? `/file_manager?${queryParamsStr}` : `/file_viewer?${queryParamsStr}`;
  };

  const searchString = (keyValSeparator: string, tokenSeparator: string) => {
    return Object.keys(omit(getHistoryURLParams(historyProps), ['resultFormat', 'zoom', 'fontSize']))
      .sort()
      .map((key) => `${key}${keyValSeparator}${historyProps[key as keyof HistoryUrlParams]}`)
      .join(tokenSeparator);
  };

  return (
    <div>
      {current.matches('error') && serverError && (
        <Warning message={'History Search Error'} error={serverError}>
          <WhiteButton onClick={() => send({ type: 'RETRY' })}>Retry</WhiteButton>
        </Warning>
      )}

      {current.matches('searching') && (
        <div className="flex flex-row justify-center" data-testid={'loading-spinner'}>
          <LoadingSpinner />
        </div>
      )}
      {current.matches('found') &&
        (history.entries.length > 0 || historyGraph ? (
          <>
            {uniqueWorkNumbers.length > 0 && (
              <>
                <div
                  className={
                    'mx-auto max-w-screen-lg flex flex-col mt-4 mb-4 w-full p-4 rounded-md justify-center bg-gray-200'
                  }
                >
                  <Heading level={4} showBorder={false}>
                    Files Uploaded
                  </Heading>
                  <div className={'flex flex-col mt-4 justify-center'} data-testid="history">
                    <Table>
                      <TableBody>
                        <TableCell className={'flex flex-col justify-center  p-2'}>
                          {uniqueWorkNumbers.map((workNumber, indx) => (
                            <StyledLink
                              data-testid={`styled-link-${workNumber}`}
                              key={workNumber}
                              to={fileUploadUrlPath(workNumber)}
                              className={`text-center bg-white ${indx > 0 && 'border-t-2 border-gray-100'}  p-2`}
                            >{`Files for ${workNumber}`}</StyledLink>
                          ))}
                        </TableCell>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
            {history.flaggedBarcodes.length > 0 && props.displayFlaggedLabware && (
              <div
                className={
                  'mx-auto max-w-screen-lg flex flex-col mt-4 mb-4 w-full p-4 rounded-md justify-center bg-gray-200'
                }
              >
                <Heading level={4} showBorder={false}>
                  Flagged Labware
                </Heading>
                <div className={'flex flex-col mt-4 justify-center'} data-testid="flagged-labware">
                  <Table>
                    <TableBody>
                      <TableCell className={'flex flex-col items-center p-2'}>
                        {history.flaggedBarcodes.map((flagBarcode, index1) => {
                          return flagBarcode.barcodes.map((barcode, index2) =>
                            FlaggedBarcodeLink(barcode, flagBarcode.priority, `${index1}-${index2}`)
                          );
                        })}
                      </TableCell>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
              History for
              <>&nbsp;</>
              <span className="text-gray-700">{`${searchString(' ', ', ')}`}</span>
              <a
                data-testid="download-button"
                href={downloadURL}
                download={`${getTimestampStr()}_${searchString('=', '&')}${extension}`}
              >
                <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
              </a>
            </div>

            {historyProps.resultFormat === 'graph' && historyGraph && (
              <div className="flex flex-col overflow-auto p-4" data-testid={'history-graph'}>
                <div className="flex flex-row justify-between border border-gray-200 bg-gray-100 p-3 rounded-md mb-8">
                  <span className="text-lg font-medium tracking-tight leading-relaxed">History Graph</span>
                  <div className="flex flex-row justify-end space-x-3">
                    <ZoomInIcon
                      onClick={() => {
                        send({
                          type: 'UPDATE_HISTORY_PROPS',
                          props: {
                            ...getHistoryURLParams(props),
                            fontSize: historyGraphFontSize,
                            zoom: historyGraphZoom + 0.1
                          }
                        });
                      }}
                      disabled={historyGraphZoom >= 10}
                    />
                    <ZoomOutIcon
                      onClick={() => {
                        send({
                          type: 'UPDATE_HISTORY_PROPS',
                          props: {
                            ...getHistoryURLParams(props),
                            fontSize: historyGraphFontSize,
                            zoom: historyGraphZoom - 0.1
                          }
                        });
                      }}
                      disabled={historyGraphZoom <= 0.1}
                    />
                    <FontSizeIcon />
                    <CustomReactSelect
                      options={[
                        { value: '6', label: '6' },
                        { value: '8', label: '8' },
                        { value: '10', label: '10' },
                        { value: '12', label: '12' },
                        { value: '14', label: '14' },
                        { value: '16', label: '16' },
                        { value: '18', label: '18' },
                        { value: '20', label: '20' }
                      ]}
                      onChange={(val) =>
                        send({
                          type: 'UPDATE_HISTORY_PROPS',
                          props: {
                            ...getHistoryURLParams(props),
                            fontSize: parseInt((val as OptionType).value),
                            zoom: historyGraphZoom
                          }
                        })
                      }
                      value={historyGraphFontSize.toString()}
                      dataTestId="font-size-select"
                    />
                  </div>
                </div>
                <img src={`data:image/svg+xml;base64,${btoa(historyGraph)}`} alt="History Graph" />
              </div>
            )}
            {history.entries.length > 0 && (
              <div className="mx-auto max-w-screen-xl">
                <TopScrollingBar>
                  <DataTable columns={historyColumns} data={history.entries} fixedHeader={true} />
                </TopScrollingBar>
              </div>
            )}
          </>
        ) : isValidInput ? (
          <Warning data-testid={'warning'} message={'No results found.'} />
        ) : (
          <></>
        ))}
    </div>
  );
}
