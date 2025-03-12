import React, { ReactNode, useImperativeHandle } from 'react';
import { Column, PluginHook, SortingRule, TableState, useSortBy, useTable } from 'react-table';
import Table, { TableBody, TableCell, TableHead, TableHeader } from './Table';
import { motion } from '../dependencies/motion';

type ColumnWithAllCapitalProp<T extends object = {}> = Column<T> & {
  allCapital?: boolean;
};
interface DataTableProps<T extends object> {
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

  /**
   * Is table column header fixed?
   */
  fixedHeader?: boolean;

  /**
   * class name list to assign to each cell, defaults to whitespace-nowrap, if none is provided
   */
  cellClassName?: string;
}

const DataTableComponent = <T extends Object>(
  {
    columns,
    data,
    defaultSort,
    sortable = false,
    fixedHeader = false,
    cellClassName
  }: React.PropsWithChildren<DataTableProps<T>>,
  ref?: React.Ref<T[]>
): React.ReactElement<DataTableProps<T>> => {
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
      initialState['sortBy'] = defaultSort;
    }
  }

  /**
   * The `useTable` hook from {@link https://react-table.tanstack.com/docs/overview React Table}
   * @see {@link https://react-table.tanstack.com/docs/api/useTable}
   */
  const instance = useTable(
    {
      columns: memoedColumns,
      data: memoedData,
      initialState
    },
    ...plugins
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = instance;

  // intended to be called outside of table via ref
  instance.download = () => {
    // get row data after sorting
    return rows.map((row) => {
      prepareRow(row);
      return row.cells.map((cell) => {
        return cell.value instanceof Date ? (cell.value as Date).toLocaleDateString() : cell.value;
      });
    });
  };

  // to access table data in sorted order from outside
  useImperativeHandle(ref, () => {
    return instance.download();
  });

  return (
    <Table {...getTableProps()}>
      <TableHead fixed={fixedHeader}>
        {headerGroups.map((headerGroup, indx) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={indx}>
            {headerGroup.headers.map((column) => (
              <TableHeader
                allCapital={(column as ColumnWithAllCapitalProp).allCapital}
                {...column.getHeaderProps(sortable ? column.getSortByToggleProps() : undefined)}
              >
                {column.render('Header') as ReactNode}
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
                  ''
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
            <motion.tr initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} {...row.getRowProps()}>
              {row.cells.map((cell, indx) => {
                return (
                  <TableCell className={cellClassName} {...cell.getCellProps()} key={row.index + ',' + indx}>
                    {cell.render('Cell') as ReactNode}
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

// Cast the output
const DataTable = React.forwardRef(DataTableComponent) as <T extends Object>(
  p: React.PropsWithChildren<DataTableProps<T>> & {
    ref?: React.Ref<T[]>;
  }
) => React.ReactElement<DataTableProps<T>>;

export default DataTable;
