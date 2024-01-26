import React from 'react';
import { CommentFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { selectOptionValues } from '../forms';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Dictionary, groupBy } from 'lodash';

export type MeasurementConfigProps = {
  name: string;
  stepIncrement: string;
  validateFunction?: (value: string) => void;
  initialMeasurementVal: string;
};
export type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurementRequest[];
  measurementConfig: MeasurementConfigProps[];
  comments?: CommentFieldsFragment[];
  onChangeField: (fieldName: string, value: string) => void;
};

type MeasurementRow = {
  address: string;
  measurements: SlotMeasurementRequest[];
};
const setMeasurementNameTableTitle = (measurementName: string): string => {
  return measurementName === 'cDNA concentration' || measurementName === 'Library concentration'
    ? `${measurementName.toUpperCase()} (pg/\u00B5l)`
    : measurementName.toUpperCase();
};

/**
 * Component to display SlotMeasurements as a table with two columns - slot address & measurement value
 *
 * @param slotMeasurements - SlotMeasurement data
 * @param comments - List of (concentration) comments to select from
 * @param onChangeMeasurement - Callback for measurementValue
 *
 */

const SlotMeasurements = ({ slotMeasurements, measurementConfig, onChangeField, comments }: SlotMeasurementProps) => {
  const [measurementRows, setMeasurementRows] = React.useState<MeasurementRow[]>([]);
  const [measurementConfigOptions, setMeasurementConfigOptions] = React.useState<MeasurementConfigProps[]>([]);

  /**concatenate all mesaurements if there are multiple measurements */

  React.useEffect(() => {
    if (measurementConfigOptions.length === measurementConfig.length) return;
    setMeasurementConfigOptions(measurementConfig);
  }, [measurementConfig, measurementConfigOptions, setMeasurementConfigOptions]);

  React.useEffect(() => {
    const groupedMeasurements: Dictionary<SlotMeasurementRequest[]> = groupBy(slotMeasurements, 'address');
    if (Object.keys(groupedMeasurements).length === measurementRows?.length) return;
    setMeasurementRows(
      Object.keys(groupedMeasurements).map((address) => {
        return {
          address,
          measurements: groupedMeasurements[address]
        };
      })
    );
  }, [slotMeasurements, measurementRows, setMeasurementRows]);

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Address',
        id: 'address',
        accessor: (measurement: MeasurementRow) => measurement.address
      },

      ...measurementConfigOptions.map((measurementProp, mesaurementIndex) => {
        return {
          Header: setMeasurementNameTableTitle(measurementProp.name),
          id: measurementProp.name,
          allCapital: false,
          Cell: ({ row }: { row: Row<MeasurementRow> }) => {
            return (
              <>
                <FormikInput
                  key={row.original.address + measurementProp.name + row.index}
                  data-testid={`${measurementProp.name}-input`}
                  type={'number'}
                  label={''}
                  name={
                    measurementConfigOptions.length > 1
                      ? `slotMeasurements.${row.index * measurementConfigOptions.length + mesaurementIndex}.value`
                      : `slotMeasurements.${row.index}.value`
                  }
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onChangeField(
                      `slotMeasurements.${row.index * measurementConfigOptions.length + mesaurementIndex}.value`,
                      e.currentTarget.value
                    );
                  }}
                  validate={measurementProp.validateFunction}
                  min={0}
                  step={measurementProp.stepIncrement}
                />
              </>
            );
          }
        };
      }),
      ...(comments?.length
        ? [
            {
              Header: 'Comments',
              id: 'Comments',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <CustomReactSelect
                    label={''}
                    dataTestId={`comments${row.index}`}
                    name={`slotMeasurements.${row.index}.commentId`}
                    className={'flex'}
                    emptyOption={true}
                    value={row.original.measurements[0].commentId}
                    handleChange={(val) => {
                      onChangeField?.(`slotMeasurements.${row.index}.commentId`, (val as OptionType).value);
                    }}
                    options={selectOptionValues(comments, 'text', 'id')}
                  />
                );
              }
            }
          ]
        : [])
    ];
  }, [comments, onChangeField, measurementConfigOptions]);

  return (
    <>
      {slotMeasurements && slotMeasurements.length > 0 && (
        <>
          <DataTable columns={columns} data={measurementRows ?? []} />
        </>
      )}
    </>
  );
};

export default SlotMeasurements;
