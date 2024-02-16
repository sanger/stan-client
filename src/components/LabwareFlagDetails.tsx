import { FlagDetail, FlagSummary } from '../types/sdk';
import Heading from './Heading';
import React from 'react';
import DataTable from './DataTable';
import { CellProps, Column } from 'react-table';
import { FlaggedBarcodeLink } from './dataTableColumns/labwareColumns';

const columns = (): Column<FlagSummary>[] => {
  return [
    {
      width: 300,
      Header: 'barcode',
      accessor: (flagSummary: FlagSummary) => {
        return FlaggedBarcodeLink(flagSummary.barcode);
      }
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: (props: CellProps<FlagSummary>) => {
        return <span>{props.row.original.description} </span>;
      }
    }
  ];
};

const flagSummary = (flagDetails: FlagDetail[]) => {
  return flagDetails
    .flatMap((details) => (details.flags ? details.flags : []))
    .sort((a, b) => a.barcode.localeCompare(b.barcode));
};

type LabwareFlagDetailsProps = { flagDetails: FlagDetail[] };
export const LabwareFlagDetails = (props: LabwareFlagDetailsProps) => {
  return (
    <div className="space-y-4 mt-6">
      <Heading level={2}>Related Flags</Heading>
      <DataTable
        columns={columns()}
        data={flagSummary(props.flagDetails)}
        fixedHeader={true}
        cellClassName="whitespace-normal"
      />
    </div>
  );
};
