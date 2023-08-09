import React from 'react';
import FormikSelect from '../forms/Select';
import { ProbeLot, ProbePanelFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import FormikInput from '../forms/Input';
import { optionValues } from '../forms';
import DataTable from '../../components/DataTable';
import RemoveButton from '../buttons/RemoveButton';
import IconButton from '../buttons/IconButton';
import AddIcon from '../icons/AddIcon';
import { useFormikContext } from 'formik';

type ProbeTableProps = {
  probePanels: ProbePanelFieldsFragment[];
  barcode?: string;
  probeLot: ProbeLot[];
  multiRowEdit?: {
    onRemove?: (barcode: string, rowIndx: number) => void;
    onAdd?: (barcode: string) => void;
    formSuffixName?: string;
  };
  onProbLotDataChange: (barcode: string, rowIndx: number, probLot: ProbeLot) => void;
};
const ProbeTable: React.FC<ProbeTableProps> = ({
  probePanels,
  barcode,
  probeLot,
  multiRowEdit,
  onProbLotDataChange
}) => {
  const { setFieldValue, values } = useFormikContext();

  // Column with delete and add action to remove and add to the end of the probe data columns passed in
  const actionColumns = React.useMemo(() => {
    return {
      Header: '',
      id: 'remove',
      Cell: ({ row }: { row: Row<ProbeLot> }) => {
        return (
          <div className={'flex flex-row space-x-2'}>
            {row.index === 0 && probeLot.length === 1 ? (
              <></>
            ) : (
              <RemoveButton
                type={'button'}
                onClick={() => {
                  multiRowEdit?.onRemove?.(barcode ?? '', row.index);
                }}
              />
            )}
            {row.index === probeLot.length - 1 && (
              <IconButton
                data-tesrtid={`probesAdd`}
                onClick={() => {
                  multiRowEdit?.onAdd?.(barcode ?? '');
                }}
                className={'focus:outline-none'}
              >
                <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
              </IconButton>
            )}
          </div>
        );
      }
    };
  }, [multiRowEdit, probeLot.length, barcode]);

  const columns = React.useMemo(() => {
    const panelFieldName = (index: number) =>
      multiRowEdit ? `${multiRowEdit.formSuffixName}.${index}.panel` : 'panel';
    const lotFieldName = (index: number) => (multiRowEdit ? `${multiRowEdit.formSuffixName}.${index}.lot` : 'lot');
    const plexFieldName = (index: number) => (multiRowEdit ? `${multiRowEdit.formSuffixName}.${index}.plex` : 'plex');
    return [
      {
        Header: 'Probe Panel',
        id: 'probePanel',
        Cell: ({ row }: { row: Row<ProbeLot> }) => {
          return (
            <>
              <FormikSelect
                label={''}
                data-testid={`probes-panel-${row.index}`}
                name={panelFieldName(row.index)}
                emptyOption={true}
                value={probeLot[row.index]?.name}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.currentTarget.value;
                  setFieldValue(panelFieldName(row.index), e.currentTarget.value);
                  onProbLotDataChange(barcode ?? '', row.index, { ...row.original, name: val });
                }}
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
        Cell: ({ row }: { row: Row<ProbeLot> }) => {
          return (
            <div className={'flex flex-col'}>
              <FormikInput
                label={''}
                name={lotFieldName(row.index)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFieldValue(lotFieldName(row.index), e.target.value);
                  onProbLotDataChange(barcode ?? '', row.index, { ...row.original, lot: e.target.value });
                }}
                value={probeLot[row.index]?.lot}
              />
            </div>
          );
        }
      },
      {
        Header: 'Plex',
        id: 'plex',
        Cell: ({ row }: { row: Row<ProbeLot> }) => {
          return (
            <FormikInput
              label={''}
              name={plexFieldName(row.index)}
              type={'number'}
              min={0}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFieldValue(plexFieldName(row.index), e.target.value);
                onProbLotDataChange(barcode ?? '', row.index, {
                  ...row.original,
                  plex: Number.parseInt(e.target.value)
                });
              }}
              value={probeLot[row.index]?.plex >= 0 ? probeLot[row.index]?.plex : ''}
            />
          );
        }
      }
    ];
  }, [probeLot, probePanels, setFieldValue, multiRowEdit, onProbLotDataChange, barcode]);

  return <DataTable columns={multiRowEdit ? [...columns, actionColumns] : columns} data={probeLot} />;
};

export default ProbeTable;
