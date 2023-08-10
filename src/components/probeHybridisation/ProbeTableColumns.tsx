import { Row } from 'react-table';
import { ProbeLot, ProbePanelFieldsFragment } from '../../types/sdk';
import FormikSelect from '../forms/Select';
import React from 'react';
import { optionValues } from '../forms';
import FormikInput from '../forms/Input';

const probeLotColumns = (probePanels: ProbePanelFieldsFragment[], prefixFieldName?: string) => {
  return [
    {
      Header: 'Probe Panel',
      id: 'probePanel',
      Cell: ({ row }: { row: Row<{ panel: string; lot: string; plex: number }> }) => {
        return (
          <>
            <FormikSelect
              label={''}
              data-testid={`probes-panel-${row.index}`}
              name={prefixFieldName ? `${prefixFieldName}.${row.index}.panel` : 'panel'}
              emptyOption={true}
            >
              {optionValues(probePanels, 'name', 'name')}
            </FormikSelect>
          </>
        );
      }
    },
    {
      Header: 'Lot Number',
      id: 'lotNumber',
      Cell: ({ row }: { row: Row<{ panel: string; lot: string; plex: number }> }) => {
        return (
          <div className={'flex flex-col'}>
            <FormikInput label={''} name={prefixFieldName ? `${prefixFieldName}.${row.index}.lot` : 'lot'} />
          </div>
        );
      }
    },
    {
      Header: 'Plex',
      id: 'plex',
      Cell: ({ row }: { row: Row<{ panel: string; lot: string; plex: number }> }) => {
        return (
          <FormikInput
            label={''}
            name={prefixFieldName ? `${prefixFieldName}.${row.index}.plex` : 'plex'}
            type={'number'}
            min={0}
          />
        );
      }
    }
  ];
};
export default probeLotColumns;
