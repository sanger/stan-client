import React from 'react';
import FormikSelect from '../forms/Select';
import { ProbeLot, ProbePanelFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import FormikInput from '../forms/Input';
import { FormikErrorMessage, optionValues } from '../forms';
import ScanInput from '../scanInput/ScanInput';
import DataTable from '../../components/DataTable';
import RemoveButton from '../buttons/RemoveButton';
import IconButton from '../buttons/IconButton';
import AddIcon from '../icons/AddIcon';

type ProbeTableProps = {
  probePanels: ProbePanelFieldsFragment[];
  probeLotData: ProbeLot[];
  enableAddRows?: boolean;
  onRemove?: (rowIndx: number) => void;
  onAdd?: () => void;
};
const ProbeTable: React.FC<ProbeTableProps> = ({ probePanels, probeLotData, enableAddRows = false, onRemove }) => {
  // Column with delete action to add to the end of the probe data columns passed in
  const removeColumn = React.useMemo(() => {
    return {
      Header: '',
      id: 'remove',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return (
          <RemoveButton
            type={'button'}
            onClick={() => {
              onRemove?.(row.index);
            }}
          />
        );
      }
    };
  }, [onRemove]);

  const addColumn = React.useMemo(() => {
    return {
      Header: '',
      id: 'add',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return row.index === probeLotData.length - 1 ? (
          <IconButton
            type={'button'}
            data-tesrtid={`probesAdd`}
            onClick={() => {
              onRemove?.(row.index);
            }}
          >
            <AddIcon />
          </IconButton>
        ) : (
          <></>
        );
      }
    };
  }, [onRemove]);

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Probe Panel',
        id: 'probePanel',
        Cell: ({ row }: { row: Row<ProbeLot> }) => {
          return (
            <FormikSelect
              label={''}
              data-testid={`probes-panel-${row.index}`}
              name={`probes.${row.index}.panel`}
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
          return (
            <div className={'flex flex-col'}>
              <ScanInput name={`probes.${row.index}.lotNumber`} />
              <FormikErrorMessage name={'lotNumber'} />
            </div>
          );
        }
      },
      {
        Header: 'Plex',
        id: 'plex',
        Cell: ({ row }: { row: Row<ProbeLot> }) => {
          return <FormikInput label={''} name={`probes.${row.index}.plex`} type={'number'} />;
        }
      }
    ];
  }, []);

  return <DataTable columns={enableAddRows ? [...columns, removeColumn, addColumn] : columns} data={probeLotData} />;
};

export default ProbeTable;
