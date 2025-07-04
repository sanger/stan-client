import React, { ReactNode } from 'react';
import IconButton from './buttons/IconButton';
import DownArrowIcon from './icons/DownArrowIcon';
import UpArrowIcon from './icons/UpArrowIcon';

interface TableProps extends React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement> {
  tableClassName?: string;
}

export type SortProps = {
  sortFieldName: string;
  ascending: boolean | undefined;
  sortHandler: (uniqueSortField: string) => void;
};

interface TableHeaderProps {
  sortProps?: SortProps;
  children?: ReactNode | ReactNode[];
  allCapital?: boolean;
  colSpan?: number;
  className?: string;
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
 * @param tableClassName
 * @param rest props passed into the HTML table
 */
const Table: React.FC<TableProps> = ({ children, tableClassName, ...rest }) => {
  return (
    <div className={'flex flex-col overflow-auto max-h-screen ' + tableClassName} datatype="table-wrapper">
      <div className="py-2 align-middle inline-block min-w-full">
        <div className="shadow-md border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200" {...rest}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;

type TableHeadProps = {
  children: ReactNode | ReactNode[];
  fixed?: boolean;
};
export const TableHead = ({ children, fixed = false }: TableHeadProps) => {
  return <thead className={`${fixed ? 'sticky top-0' : ''}`}>{children}</thead>;
};

export const TableHeader = ({
  children,
  sortProps,
  allCapital = true,
  colSpan,
  className,
  ...rest
}: TableHeaderProps) => {
  return (
    <th className="px-6 py-3 bg-gray-50 text-left select-none" colSpan={colSpan} {...rest}>
      <>
        {
          <IconButton
            type="button"
            data-testid={`${sortProps && sortProps.sortFieldName}-SortButton`}
            onClick={() => {
              sortProps && sortProps.sortHandler(sortProps.sortFieldName);
            }}
          >
            {
              <span
                className={`bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 tracking-wide ${
                  allCapital ? 'uppercase' : ''
                } ${className}`}
              >
                {children}
              </span>
            }
            {sortProps &&
              (sortProps.ascending !== undefined ? sortProps.ascending ? <UpArrowIcon /> : <DownArrowIcon /> : <></>)}
          </IconButton>
        }
      </>
    </th>
  );
};

export const TableBody = ({ children, ...rest }: TableHeadProps) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200 overflow-x-hidden" {...rest}>
      {children}
    </tbody>
  );
};

export const TableCell: React.FC<
  React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>
> = ({ children, className, ...rest }) => {
  return (
    <td className={`px-6 py-4 ${className ? className : 'whitespace-nowrap'}`} {...rest}>
      {children}
    </td>
  );
};

type Props = {
  children: string | ReactNode | ReactNode[];
  className?: string;
};
export const TabelSubHeader: React.FC<Props> = ({ children, className, ...rest }) => {
  const baseClasses = 'flex text-xs font-medium text-gray-500 uppercase';
  const classNames = `${baseClasses} ${className ?? ''}`.trim();
  return (
    <div className={classNames} {...rest}>
      {children}
    </div>
  );
};
export const TabelCentredCell: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <div className="flex items-center justify-center" {...rest}>
      {children}
    </div>
  );
};
