import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Labware, LabwareLayoutFragment } from "../../types/graphql";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import RemoveIcon from "../icons/RemoveIcon";
import { motion } from "framer-motion";
import { Column, Row } from "react-table";
import MutedText from "../MutedText";
import LockIcon from "../icons/LockIcon";
import LabwareTable from "../LabwareTable";
import ScanInput from "../ScanInput";
import { createLabwareMachine } from "../../lib/machines/labware/labwareMachine";

/**
 * Props for {@link LabwareScanTable}
 */
interface LabwareScanTableProps {
  /**
   * The list of columns to display in the table
   */
  columns: Column<LabwareLayoutFragment>[];

  /**
   * Called when the labwares in the table changes
   * @param labwares the list of current labwares in the table
   */
  onChange?: (labwares: Labware[]) => void;

  /**
   * Lock the table. User won't be able to scan anything in, or remove anything.
   */
  locked?: boolean;
}

const LabwareScanTable: React.FC<LabwareScanTableProps> = ({
  columns,
  onChange,
  locked = false,
}) => {
  const [current, send, service] = useMachine(createLabwareMachine());

  useEffect(() => {
    service.onEvent((e) => {
      if (e.type === "done.invoke.findLabware" || e.type === "REMOVE_LABWARE") {
        onChange?.(service.state.context.labwares);
      }
    });
  }, [service, onChange]);

  useEffect(() => {
    send(locked ? { type: "LOCK" } : { type: "UNLOCK" });
  }, [send, locked]);

  // Memoize the data for the table
  const data = React.useMemo(() => current.context.labwares, [
    current.context.labwares,
  ]);

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const actionsColumn: Column<LabwareLayoutFragment> = React.useMemo(() => {
    return {
      Header: "",
      id: "actions",
      Cell: ({ row }: { row: Row<LabwareLayoutFragment> }) => {
        if (current.matches("locked")) {
          return <LockIcon className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <button
            onClick={() => {
              row.original.barcode &&
                send({
                  type: "REMOVE_LABWARE",
                  value: row.original.barcode,
                });
            }}
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-100 focus:outline-none focus:bg-red-100 text-red-400 hover:text-red-600"
          >
            <RemoveIcon className="block h-5 w-5" />
          </button>
        );
      },
    };
  }, [send, current]);

  /**
   * Merge the columns passed in with the actionsColumn, memoizing the result.
   */
  const allColumns: Column<LabwareLayoutFragment>[] = [
    ...columns,
    actionsColumn,
  ];

  return (
    <div>
      {current.matches("idle.success") && current.context.successMessage && (
        <Success message={current.context.successMessage} />
      )}
      {current.matches("idle.error") && current.context.errorMessage && (
        <Warning message={current.context.errorMessage} />
      )}

      <ScanInput
        id="labwareScanInput"
        value={current.context.currentBarcode}
        type="text"
        disabled={!current.matches("idle")}
        onChange={(e) => {
          send({
            type: "UPDATE_CURRENT_BARCODE",
            value: e.currentTarget.value,
          });
        }}
        onScan={(_value) => {
          send({ type: "SUBMIT_BARCODE" });
        }}
      />

      {current.context.labwares.length === 0 && (
        <MutedText>Scan a piece of labware to get started</MutedText>
      )}

      {current.context.labwares.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <LabwareTable columns={allColumns} labware={data} />
        </motion.div>
      )}
    </div>
  );
};

export default LabwareScanTable;
