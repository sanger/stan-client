import React, { useCallback, useMemo } from "react";
import { ExtractResult, LabwareFieldsFragment } from "../../types/sdk";
import { motion } from "framer-motion";
import MutedText from "../MutedText";
import LockIcon from "../icons/LockIcon";
import DataTable from "../DataTable";
import RemoveButton from "../buttons/RemoveButton";
import extractResultColumn from "../dataTable/extractResultColumn";
import { Row } from "react-table";
import { useMachine } from "@xstate/react";
import { rnaAnalysisMachine } from "../../lib/machines/analysis/rnaAnalysisMachine";
import { extractResultMachine } from "./extractResult.machine";
import Warning from "../notifications/Warning";
import ScanInput from "../scanInput/ScanInput";

/**
 * Props for {@link LabwareScanPanel}
 */
interface ExtractResultPanelProps {}

const ExtractResultPanel: React.FC<ExtractResultPanelProps> = ({}) => {
  const [current, send] = useMachine(() =>
    extractResultMachine.withContext({ extractResults: [], currentBarcode: "" })
  );
  const {
    serverError,
    extractResults,
    scanErrorMessage,
    currentBarcode,
  } = current.context;
  const scanError = scanErrorMessage
    ? scanErrorMessage
    : current.matches("extractResultFailure") && serverError
    ? serverError.message
    : undefined;

  const onRemoveExtractResult = React.useCallback((barcode: string) => {
    send({ type: "REMOVE_EXTRACT_RESULT", barcode: barcode });
  }, []);

  const handleOnScanInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debugger;
      send({
        type: "UPDATE_BARCODE",
        barcode: e.currentTarget.value,
      });
    },
    [send]
  );

  const locked = false;
  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const actionsColumn = React.useMemo(() => {
    return {
      Header: "",
      id: "actions",
      Cell: ({ row }: { row: Row<ExtractResult> }) => {
        if (locked) {
          return <LockIcon className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <RemoveButton
            onClick={() => {
              row.original.labware.barcode &&
                onRemoveExtractResult(row.original.labware.barcode);
            }}
          />
        );
      },
    };
  }, [locked]);

  const columns = useMemo(
    () => [
      extractResultColumn.barcode(),
      extractResultColumn.externalName(),
      extractResultColumn.tissueType(),
      extractResultColumn.medium(),
      extractResultColumn.fixative(),
      extractResultColumn.nanodropResult(),
      actionsColumn,
    ],
    []
  );

  return (
    <div>
      {extractResults.length === 0 && (
        <MutedText>Scan a piece of labware to get started</MutedText>
      )}
      {scanError && <Warning className="mt-2 my-2 mb-4" message={scanError} />}
      <div className="sm:w-2/3 md:w-1/2 mb-4">
        <ScanInput
          id={"extractionScanInput"}
          onScan={(value) => send({ type: "SUBMIT_BARCODE", barcode: value })}
          value={currentBarcode}
          onChange={handleOnScanInputChange}
        />
      </div>

      {extractResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <DataTable columns={columns} data={extractResults} />
        </motion.div>
      )}
    </div>
  );
};

export default ExtractResultPanel;
