import DataTable from '../DataTable';
import { Column, Row } from 'react-table';
import React from 'react';
import { RoiFieldsFragment } from '../../types/sdk';
import { alphaNumericSortDefault } from '../../types/stan';

type RoiTableRow = {
  roi: string;
  externalIdAddress: Array<{ externalId: string; address: string }>;
};

type RoiTableProps<T extends RoiFieldsFragment> = {
  actionColumn: Column<T>;
  data: RoiTableRow[];
};

export const groupByRoi = (rois: RoiFieldsFragment[]): Record<string, RoiFieldsFragment[]> => {
  return rois
    .sort((a, b) => alphaNumericSortDefault(a.address, b.address))
    .reduce(
      (acc, data) => {
        if (!acc[data.roi]) {
          acc[data.roi] = [];
        }
        acc[data.roi].push(data);
        return acc;
      },
      {} as Record<string, RoiFieldsFragment[]>
    );
};
const RoiTable = ({ actionColumn, data }: RoiTableProps<any>) => {
  return (
    <DataTable
      columns={[
        {
          Header: 'Region of interest',
          accessor: 'roi'
        },
        {
          Header: 'External ID',
          Cell: ({ row }: { row: Row<RoiTableRow> }) => {
            return (
              <div className="grid grid-cols-1 text-wrap">
                {row.original.externalIdAddress.map((data, index) => {
                  return (
                    <label className="py-1" key={`${data.externalId}-${index}`}>
                      {data.externalId}
                    </label>
                  );
                })}
              </div>
            );
          }
        },
        {
          Header: 'Address',
          Cell: ({ row }: { row: Row<RoiTableRow> }) => {
            return (
              <div className="grid grid-cols-1 text-wrap">
                {row.original.externalIdAddress.map((data, index) => {
                  return (
                    <label className="py-1" key={`${data.address}-${index}`}>
                      {data.address}
                    </label>
                  );
                })}
              </div>
            );
          }
        },
        actionColumn
      ]}
      data={data}
    />
  );
};

export default RoiTable;
