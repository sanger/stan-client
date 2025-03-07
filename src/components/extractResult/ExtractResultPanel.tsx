import React, { useCallback, useMemo } from 'react';
import { ExtractResultQuery } from '../../types/sdk';
import { motion } from '../../dependencies/motion';
import MutedText from '../MutedText';
import LockIcon from '../icons/LockIcon';
import DataTable from '../DataTable';
import RemoveButton from '../buttons/RemoveButton';
import extractResultColumn from '../dataTableColumns/extractResultColumn';
import { Row } from 'react-table';
import { useMachine } from '@xstate/react';
import { extractResultMachine } from './extractResult.machine';
import Warning from '../notifications/Warning';
import ScanInput from '../scanInput/ScanInput';

/**
 * Props for {@link ExtractResultPanel}
 */
type ExtractResultPanelProps = {
  /**
   * Called when extraction result is added or removed
   * @param resultArr the list of current extraction results
   */
  onChangeExtractResults?: (resultArr: ExtractResultQuery[]) => void;

  /**
   * True is the scanner should be locked; false otherwise
   */
  locked: boolean;

  initExtractedResults?: ExtractResultQuery[];
};

const ExtractResultPanel: React.FC<ExtractResultPanelProps> = ({
  onChangeExtractResults,
  locked,
  initExtractedResults
}) => {
  const machine = React.useMemo(() => {
    return extractResultMachine(initExtractedResults ?? []);
  }, [initExtractedResults]);
  const [current, send] = useMachine(machine);

  const { serverError, extractResults, scanErrorMessage, currentBarcode } = current.context;

  const formatErrorMessage = (message: string) => {
    const firstcolonIndx = message.indexOf(':');
    const secondcolonIndx = message.indexOf(':', firstcolonIndx + 1);
    if (firstcolonIndx > 0 && secondcolonIndx > 0)
      return message.substr(firstcolonIndx + 1, secondcolonIndx - firstcolonIndx - 1);
    else return message;
  };

  const scanError = scanErrorMessage
    ? scanErrorMessage
    : serverError && serverError.message
      ? formatErrorMessage(serverError.message)
      : undefined;

  React.useEffect(() => {
    onChangeExtractResults && onChangeExtractResults(extractResults);
  }, [extractResults, onChangeExtractResults]);

  const onRemoveExtractResult = React.useCallback(
    (barcode: string) => {
      send({ type: 'REMOVE_EXTRACT_RESULT', barcode: barcode });
    },
    [send]
  );

  const handleOnScanInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      send({
        type: 'UPDATE_BARCODE',
        barcode: e.currentTarget.value
      });
    },
    [send]
  );

  // Column with actions (such as delete) to add to the end of the extraxtResultColumns
  const actionsColumn = React.useMemo(() => {
    return {
      Header: '',
      id: 'actions',
      Cell: ({ row }: { row: Row<ExtractResultQuery> }) => {
        if (locked) {
          return <LockIcon data-testid="lock" className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <RemoveButton
            data-testid="remove"
            onClick={() => {
              row.original.extractResult.labware.barcode &&
                onRemoveExtractResult(row.original.extractResult.labware.barcode);
            }}
          />
        );
      }
    };
  }, [locked, onRemoveExtractResult]);

  const columns = useMemo(
    () => [
      extractResultColumn.barcode(),
      extractResultColumn.externalName(),
      extractResultColumn.tissueType(),
      extractResultColumn.medium(),
      extractResultColumn.fixative(),
      extractResultColumn.nanodropResult(),
      actionsColumn
    ],
    [actionsColumn]
  );

  return (
    <div>
      {extractResults.length === 0 && <MutedText>Scan a piece of labware to get started</MutedText>}
      {scanError && <Warning className="mt-2 my-2 mb-4" message={scanError} />}
      <div className="sm:w-2/3 md:w-1/2 mb-4">
        <ScanInput
          id={'labwareScanInput'}
          onScan={(value) => send({ type: 'SUBMIT_BARCODE', barcode: value })}
          value={currentBarcode}
          onChange={handleOnScanInputChange}
          disabled={locked}
        />
      </div>

      {extractResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <DataTable columns={columns} data={extractResults} />
        </motion.div>
      )}
    </div>
  );
};

export default ExtractResultPanel;
