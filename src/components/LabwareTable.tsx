import React from "react";
import { Column, useTable } from "react-table";
import { LabwareLayoutFragment } from "../types/graphql";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "./Table";
import { motion } from "framer-motion";

interface LabwareTableProps {
  columns: Column<LabwareLayoutFragment>[];
  labware: LabwareLayoutFragment[];
}

const LabwareTable: React.FC<LabwareTableProps> = ({ columns, labware }) => {
  /**
   * Memoize columns
   */
  const memoedColumns = React.useMemo(() => columns, [columns]);

  /**
   * Memoize data
   */
  const data = React.useMemo(() => labware, [labware]);

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
    columns: memoedColumns,
    data,
  });

  return (
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
  );
};

export default LabwareTable;
