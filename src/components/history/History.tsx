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
import { getTimestampStr } from '../../lib/helpers';
import { useDownload } from '../../lib/hooks/useDownload';

/**
 * Component for looking up and displaying the history of labware and samples
 */
export default function History(props: HistoryProps) {
  const historyMachine = React.useMemo(() => {
    return createHistoryMachine(props);
  }, [props]);
  const [current, send] = useMachine(historyMachine);

  const { history, historyProps, serverError } = current.context;

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

  /**
   * If the props change, send an update event to the machine
   */
  useEffect(() => {
    send({ type: 'UPDATE_HISTORY_PROPS', props });
  }, [props, send]);

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
            <DataTable columns={historyColumns} data={history} />
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
