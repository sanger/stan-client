import React, { useEffect } from 'react';
import createHistoryMachine from './history.machine';
import { useMachine } from '@xstate/react';
import DataTable from '../DataTable';
import { Cell, Column } from 'react-table';
import { HistoryProps, HistoryTableEntry } from '../../types/stan';
import StyledLink from '../StyledLink';
import Warning from '../notifications/Warning';
import WhiteButton from '../buttons/WhiteButton';
import LoadingSpinner from '../icons/LoadingSpinner';
import { LabwareStatePill } from '../LabwareStatePill';
import DownloadIcon from '../icons/DownloadIcon';
import { getTimestampStr, stringify } from '../../lib/helpers';
import { useDownload } from '../../lib/hooks/useDownload';
import Heading from '../Heading';
import Table, { TableBody, TableCell } from '../Table';
import { useAuth } from '../../context/AuthContext';

/**
 * Component for looking up and displaying the history of labware and samples
 */
export default function History(props: HistoryProps) {
  const historyMachine = React.useMemo(() => {
    return createHistoryMachine(props);
  }, [props]);
  const [current, send] = useMachine(historyMachine);

  const { isAuthenticated } = useAuth();

  const { history, historyProps, serverError } = current.context;

  const historyColumns: Array<Column> = React.useMemo(
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
        Cell: (props: Cell<HistoryTableEntry>) => {
          const barcode = props.row.original.sourceBarcode;
          let classes =
            historyProps.kind === 'labwareBarcode' && barcode === historyProps.value
              ? 'bg-yellow-400 text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide'
              : '';
          return (
            <StyledLink to={`/labware/${barcode}`} className={classes ? classes : undefined}>
              {barcode}
            </StyledLink>
          );
        }
      },
      {
        Header: 'Destination',
        accessor: 'destinationBarcode',
        Cell: (props: Cell<HistoryTableEntry>) => {
          const barcode = props.row.original.destinationBarcode;
          let classes =
            historyProps.kind === 'labwareBarcode' && barcode === historyProps.value
              ? 'bg-yellow-400 text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide'
              : '';
          return (
            <StyledLink to={`/labware/${barcode}`} className={classes ? classes : undefined}>
              {barcode}
            </StyledLink>
          );
        }
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
        Header: 'Biological State',
        accessor: 'biologicalState'
      },
      {
        Header: 'Labware State',
        accessor: 'labwareState',
        Cell: (props: Cell<HistoryTableEntry>) => (
          <LabwareStatePill labware={{ state: props.row.original.labwareState }} />
        )
      },
      {
        Header: 'Details',
        accessor: 'details',
        Cell: (props: Cell<HistoryTableEntry>) => {
          const details = props.row.original.details.map((detail) => {
            return <li key={detail}>{detail}</li>;
          });
          if (props.row.original.eventType.toLowerCase() === 'release') {
            const releaseId = props.row.original.eventId;
            const releaseUrl = `/release?id=${releaseId}`;
            details.push(
              <li key={releaseUrl}>
                <a href={releaseUrl} download={'release.tsv'}>
                  <DownloadIcon className={'inline-block h-5 w-5 -mt-1 -ml-1 mr-2'} />
                  Release file
                </a>
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
    return {
      columnData: {
        columns: historyColumns
      },
      entries: history
    };
  }, [history, historyColumns]);

  const { downloadURL, extension } = useDownload(downloadData);

  const uniqueWorkNumbers = React.useMemo(() => {
    const uniqueWorkNumbers = [...new Set(history.map((item) => item.workNumber))];
    const workNumbers: string[] = [];
    uniqueWorkNumbers.forEach((wrkNumber) => {
      if (wrkNumber && wrkNumber.length > 0) {
        workNumbers.push(wrkNumber);
      }
    });
    return workNumbers;
  }, [history]);

  /**
   * If the props change, send an update event to the machine
   */
  useEffect(() => {
    send({ type: 'UPDATE_HISTORY_PROPS', props });
  }, [props, send]);

  /**
   * File upload option is only for authenticated users, so
   * only allow permission to view or download uploaded files if not authenticated
   */
  const fileAccessUrlPath = (workNumber: string) => {
    const queryParamsStr = stringify({
      workNumber: workNumber
    });
    return isAuthenticated() ? `/file_manager?${queryParamsStr}` : `/file_viewer?${queryParamsStr}`;
  };
  return (
    <div data-testid="history">
      {current.matches('error') && serverError && (
        <Warning message={'History Search Error'} error={serverError}>
          <WhiteButton onClick={() => send({ type: 'RETRY' })}>Retry</WhiteButton>
        </Warning>
      )}

      {current.matches('searching') && (
        <div className="flex flex-row justify-center">
          <LoadingSpinner />
        </div>
      )}

      {current.matches('found') &&
        (history.length > 0 ? (
          <>
            {uniqueWorkNumbers.length > 0 && (
              <div
                className={
                  'mx-auto max-w-screen-lg flex flex-col mt-4 mb-4 w-full p-4 rounded-md justify-center bg-gray-200'
                }
              >
                <Heading level={4} showBorder={false}>
                  Files Uploaded
                </Heading>
                <div className={'flex flex-col mt-4 justify-center'}>
                  <Table>
                    <TableBody>
                      <TableCell className={'flex flex-col justify-center  p-2'}>
                        {uniqueWorkNumbers.map((workNumber, indx) => (
                          <StyledLink
                            to={fileAccessUrlPath(workNumber)}
                            className={`text-center bg-white ${indx > 0 && 'border-t-2 border-gray-100'}  p-2`}
                          >{`Files for ${workNumber}`}</StyledLink>
                        ))}
                      </TableCell>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
              <p className="text-sm text-gray-700">
                History for {historyDisplayValues[props.kind]} <span className="font-medium">{props.value}</span>
              </p>
              <a
                href={downloadURL}
                download={`${getTimestampStr()}_${historyProps.kind}_${historyProps.value}${extension}`}
              >
                <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
              </a>
            </div>
            <DataTable data-testid={'history-table'} columns={historyColumns} data={history} fixedHeader={true} />
          </>
        ) : (
          <Warning message={'No results found.'} />
        ))}
    </div>
  );
}

export const historyDisplayValues: { [key in HistoryProps['kind']]: string } = {
  labwareBarcode: 'Labware Barcode',
  sampleId: 'Sample ID',
  externalName: 'External ID',
  donorName: 'Donor Name',
  workNumber: 'Work Number'
};
