import React from "react";
import IconButton from "./buttons/IconButton";
import DownArrowIcon from "./icons/DownArrowIcon";
import UpArrowIcon from "./icons/UpArrowIcon";

interface TableProps
  extends React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  > {}

export type SortProps = {
  sortable: boolean;
  sortField: string;
  ascending: boolean | undefined;
  sortHandler: (sortField: string) => void;
};

interface TableHeaderProps {
  sortProps?: SortProps;
  children?: React.ReactNode;
}
/**
 * @example
 * <Table>
 *  <TableHead>
 *    <tr>
 *      <TableHeader>Barcode</TableHeader><TableHeader>Type</TableHeader>
 *    </tr>
 *  </TableHead>
 *  <TableBody>
 *    <tr>
 *      <TableCell>STAN-123</TableCell><TableCell>Proviasette</TableCell>
 *    </tr>
 *  </TableBody>
 * </Table>
 *
 * @param children
 * @param rest props passed into the HTML table
 */
const Table: React.FC<TableProps> = ({ children, ...rest }) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200" {...rest}>
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;

export const TableHead: React.FC = ({ children }) => {
  return <thead>{children}</thead>;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  sortProps,
  ...rest
}) => {
  return (
    <th className="px-6 py-3 bg-gray-50 text-left select-none" {...rest}>
      <>
        {
          <IconButton
            type="button"
            onClick={() => {
              sortProps && sortProps.sortHandler(sortProps.sortField);
            }}
          >
            {
              <span
                className={
                  "bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 tracking-wider uppercase"
                }
              >
                {children}
              </span>
            }
            {sortProps &&
              (sortProps.ascending !== undefined ? (
                sortProps.ascending ? (
                  <UpArrowIcon />
                ) : (
                  <DownArrowIcon />
                )
              ) : (
                <></>
              ))}
          </IconButton>
        }
      </>
    </th>
  );
};

export const TableBody: React.FC = ({ children, ...rest }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200" {...rest}>
      {children}
    </tbody>
  );
};

export const TableCell: React.FC<React.DetailedHTMLProps<
  React.TdHTMLAttributes<HTMLTableDataCellElement>,
  HTMLTableDataCellElement
>> = ({ children, ...rest }) => {
  return (
    <td className="px-6 py-4 whitespace-nowrap" {...rest}>
      {children}
    </td>
  );
};
