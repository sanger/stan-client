import React from "react";
import { useActor } from "@xstate/react";
import { Labware } from "../../types/graphql";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import RemoveIcon from "../icons/RemoveIcon";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import { motion } from "framer-motion";
import { Column, Row, useTable } from "react-table";
import { Actor, ActorRef } from "xstate";
import BarcodeIcon from "../icons/BarcodeIcon";
import MutedText from "../MutedText";
import classNames from "classnames";
import LockIcon from "../icons/LockIcon";
import { LabwareEvents, LabwareMachineType } from "../../lib/machines/labware";

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
  actor: ActorRef<LabwareEvents, LabwareMachineType["state"]>;

  /**
   * The list of columns to display in the table
   */
  columns: Column<Labware>[];
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
  const actionsColumn: Column<Labware> = React.useMemo(() => {
    return {
      Header: "",
      id: "actions",
      Cell: ({ row }: { row: Row<Labware> }) => {
        if (current.matches("locked")) {
          return <LockIcon className="block m-2 h-5 w-5 text-gray-800" />;
        }

        return (
          <button
            onClick={() => {
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
  const allColumns: Column<Labware>[] = React.useMemo(
    () => [...columns, actionsColumn],
    [columns, actionsColumn]
  );

  /**
   * The `useTable` hook from {@link https://react-table.tanstack.com/docs/overview React Table}
   * @see {@link https://react-table.tanstack.com/docs/api/useTable}
   */
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns: allColumns,
    data,
  });

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

      <div className="mt-3 flex rounded-md shadow-sm md:w-1/2">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          <BarcodeIcon className="block h-5 w-5" />
        </span>
        <input
          id="labwareScanInput"
          value={current.context.currentBarcode}
          type="text"
          disabled={!current.matches("idle")}
          onKeyDown={(e) => {
            if (["Tab", "Enter"].some((triggerKey) => triggerKey === e.key)) {
              e.preventDefault();
              send({ type: "SUBMIT_BARCODE" });
            }
          }}
          onChange={(e) => {
            send({
              type: "UPDATE_CURRENT_BARCODE",
              value: e.currentTarget.value,
            });
          }}
          className={inputClassNames}
        />
        {current.matches("locked") && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 transition duration-150 ease-in-out text-sm">
            <LockIcon className="block h-5 w-5 text-sp-300 transition duration-150 ease-in-out" />
          </span>
        )}
      </div>

      {current.context.labwares.length === 0 && (
        <MutedText>Scan a piece of labware to get started</MutedText>
      )}

      {current.context.labwares.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <Table {...getTableProps()}>
            <TableHead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <TableHeader {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </TableHeader>
                  ))}
                </tr>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <motion.tr
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
};

export default LabwareScanTable;
