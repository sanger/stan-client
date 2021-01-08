import React from "react";
import { useActor } from "@xstate/react";
import { LabwareLayoutFragment } from "../../types/graphql";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import RemoveIcon from "../icons/RemoveIcon";
import { motion } from "framer-motion";
import { Column, Row } from "react-table";
import BarcodeIcon from "../icons/BarcodeIcon";
import MutedText from "../MutedText";
import classNames from "classnames";
import LockIcon from "../icons/LockIcon";
import {
  LabwareEvents,
  LabwareMachineActorRef,
  LabwareMachineType,
} from "../../lib/machines/labware";
import LabwareTable from "../LabwareTable";
import ScanInput from "../ScanInput";

/**
 * Props for {@link LabwareScanTable}
 */
interface LabwareScanTableProps {
  /**
   * {@link https://xstate.js.org/docs/guides/actors.html#spawning-machines Actor} to that will be passed into `useActor`.
   *
   * @remarks
   * This should be a spawned instance of {@link labwareMachine}
   */
  actor: LabwareMachineActorRef;

  /**
   * The list of columns to display in the table
   */
  columns: Column<LabwareLayoutFragment>[];
}

const LabwareScanTable: React.FC<LabwareScanTableProps> = ({
  actor,
  columns,
}) => {
  /**
   * The `useActor` hook gives back the current state of the Actor (i.e. labwareMachine) and a function to send events
   * to the actor
   *
   * @see {@link https://xstate.js.org/docs/packages/xstate-react/#useactor-actor-getsnapshot}
   */
  const [current, send] = useActor<LabwareEvents, LabwareMachineType["state"]>(
    actor
  );

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

  const inputClassNames = classNames(
    {
      "rounded-r-md": !current.matches("locked"),
      "border-r-0 disabled:bg-gray-100": current.matches("locked"),
    },
    "flex-grow-0 focus:ring-sdb-100 focus:border-sdb-100 block w-full border-gray-300 rounded-none transition duration-150 ease-in-out"
  );

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
        locked={current.matches("locked")}
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
