import { Row } from 'react-table';
import { ProbeLot, ProbePanelFieldsFragment } from '../../types/sdk';
import FormikSelect from '../forms/Select';
import React from 'react';
import { optionValues } from '../forms';
import FormikInput from '../forms/Input';
import ScanInput from '../scanInput/ScanInput';

const probeLotColumns = (probePanels: ProbePanelFieldsFragment[], values: ProbeLot[], prefixFieldName?: string) => {
  return [
    {
      Header: 'Probe Panel',
      id: 'probePanel',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return (
          <FormikSelect
            label={''}
            data-testid={`probes-panel-${row.index}`}
            name={prefixFieldName ? `${prefixFieldName}.${row.index}.name` : 'name'}
            emptyOption={true}
          >
            {optionValues(probePanels, 'name', 'name')}
          </FormikSelect>
        );
      }
    },
    {
      Header: 'Lot Number',
      id: 'lotNumber',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return <ScanInput label={''} name={prefixFieldName ? `${prefixFieldName}.${row.index}.lot` : 'lot'} />;
      }
    },
    {
      Header: 'Plex',
      id: 'plex',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return (
          <FormikInput
            label={''}
            name={prefixFieldName ? `${prefixFieldName}.${row.index}.plex` : 'plex'}
            type={'number'}
            min={0}
            value={values[row.index].plex > 0 ? values[row.index].plex : ''}
          />
        );
      }
    }
  ];
};
export default probeLotColumns;
