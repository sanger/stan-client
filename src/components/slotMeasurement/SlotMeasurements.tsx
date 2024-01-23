import React from 'react';
import { CommentFieldsFragment, SampleFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { selectOptionValues } from '../forms';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Dictionary, groupBy } from 'lodash';
import { TableCell } from '../Table';

export type MeasurementConfigProps = {
  name: string;
  stepIncrement: string;
  validateFunction?: (value: string) => void;
  initialMeasurementVal: string;
};

export interface SlotMeasurement extends SlotMeasurementRequest {
  samples?: SampleFieldsFragment[];
}
export type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurement[];
  measurementConfig: MeasurementConfigProps[];
  comments?: CommentFieldsFragment[];
  onChangeField: (fieldName: string, value: string) => void;
};

type MeasurementRow = {
  address: string;
  measurements: SlotMeasurementRequest[];
  samples?: SampleFieldsFragment[];
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
  const [measurementConfigOptions, setMeasurementConfigOptions] = React.useState<MeasurementConfigProps[]>([]);

  const isWithSampleInfo = React.useMemo(
    () => slotMeasurements.some((measurement) => measurement.samples),
    [slotMeasurements]
  );

  /**concatenate all mesaurements if there are multiple measurements */
  React.useEffect(() => {
    if (measurementConfigOptions.length === measurementConfig.length) return;
    setMeasurementConfigOptions(measurementConfig);
  }, [measurementConfig, measurementConfigOptions, setMeasurementConfigOptions]);

  const measurementRowValues: MeasurementRow[] = React.useMemo(() => {
    const groupedMeasurements: Dictionary<SlotMeasurement[]> = groupBy(slotMeasurements, 'address');
    const values: MeasurementRow[] = [];
    if (isWithSampleInfo) {
      for (const address in groupedMeasurements) {
        groupedMeasurements[address].forEach((measurement) => {
          values.push({
            address,
            measurements: groupedMeasurements[address],
            samples: measurement.samples
          });
        });
      }
    } else {
      for (const address in groupedMeasurements) {
        values.push({
          address,
          measurements: groupedMeasurements[address]
        });
      }
    }
    return values;
  }, [slotMeasurements, isWithSampleInfo]);

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Address',
        id: 'address',
        accessor: (measurement: MeasurementRow) => measurement.address
      },
      ...(isWithSampleInfo
        ? [
            {
              Header: 'External ID',
              id: 'externalId',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <TableCell>
                    {row.original.samples?.map((sample) => {
                      return (
                        <div className="flex px-6">
                          <label>{sample.tissue.externalName}</label>
                        </div>
                      );
                    })}
                  </TableCell>
                );
              }
            },
            {
              Header: 'Section Number',
              id: 'sectionNumber',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <TableCell>
                    {row.original.samples?.map((sample) => {
                      return (
                        <div className="flex items-right px-6">
                          <label>{sample.section}</label>
                        </div>
                      );
                    })}
                  </TableCell>
                );
              }
            }
          ]
        : []),
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
  }, [comments, onChangeField, measurementConfigOptions, isWithSampleInfo]);

  return (
    <>
      {slotMeasurements && slotMeasurements.length > 0 && (
        <>
          <DataTable columns={columns} data={measurementRowValues ?? []} />
        </>
      )}
    </>
  );
};

export default SlotMeasurements;
