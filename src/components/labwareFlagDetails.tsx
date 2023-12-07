import { FlagDetail, FlagSummary } from '../types/sdk';
import Heading from './Heading';
import React from 'react';
import DataTable from './DataTable';
import { Cell, Column } from 'react-table';
import StyledLink from './StyledLink';
import FlagIcon from './icons/FlagIcon';

const columns = (): Column<FlagSummary>[] => {
  return [
    {
      width: 300,
      Header: 'barcode',
      accessor: (flagSummary: FlagSummary) => {
        return (
          <div className="whitespace-nowrap">
            <StyledLink
              className="text-sp bg-transparent hover:text-sp-700 active:text-sp-800"
              to={`/labware/${flagSummary.barcode}`}
            >
              <FlagIcon className="inline-block h-5 w-5 -ml-1 mr-1 mb-2" />
              {flagSummary.barcode}
            </StyledLink>
          </div>
        );
      }
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: (props: Cell<FlagSummary>) => {
        return props.row.original.description;
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
