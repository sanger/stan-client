import React from "react";
import {
  Column,
  PluginHook,
  SortingRule,
  TableState,
  useSortBy,
  useTable,
} from "react-table";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "./Table";
import { motion } from "framer-motion";

interface LabwareTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];

  /**
   * Should the user be able to sort the data in this table?
   */
  sortable?: boolean;

  /**
   * An identifier for the column the table should initially be sorted by
   * @example { id: "donorName" }
   */
  defaultSort?: SortingRule<T>[];
}

function DataTable<T extends object>({
  columns,
  data,
  defaultSort,
  sortable = false,
}: React.PropsWithChildren<LabwareTableProps<T>>): React.ReactElement<
  LabwareTableProps<T>
> {
  /**
   * Memoize columns
   */
  const memoedColumns = React.useMemo(() => columns, [columns]);

  /**
   * Memoize memoedData
   */
  const memoedData = React.useMemo(() => data, [data]);

  const plugins: PluginHook<T>[] = [];
  const initialState: Partial<TableState<T>> = {};

  /**
   * Use `useSortBy` plugin if data should be sortable
   */
  if (sortable) {
    plugins.push(useSortBy);
    if (defaultSort) {
      initialState["sortBy"] = defaultSort;
    }
  }

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
  } = useTable(
    {
      columns: memoedColumns,
      data: memoedData,
      initialState,
    },
    ...plugins
  );

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableHeader
                {...column.getHeaderProps(
                  sortable ? column.getSortByToggleProps() : undefined
                )}
              >
                {column.render("Header")}
                {column.isSorted ? (
                  column.isSortedDesc ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="inline-block h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="inline-block h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )
                ) : (
                  ""
                )}
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
}

export default DataTable;
