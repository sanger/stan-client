import React from 'react';
import { CommentFieldsFragment, SampleFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { selectOptionValues } from '../forms';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Dictionary, groupBy } from 'lodash';

export type MeasurementConfigProps = {
  measurementType: string[];
  name: string;
  unit?: string;
  stepIncrement?: string;
  validateFunction?: (value: string) => void;
  initialMeasurementVal?: string;
  readOnly?: boolean;
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

/**
 * Component to display SlotMeasurements as a table with two columns - slot address & measurement value
 *
 * @param slotMeasurements - SlotMeasurement data
 * @param comments - List of (concentration) comments to select from
 * @param onChangeMeasurement - Callback for measurementValue
 *
 */

const SlotMeasurements = ({ slotMeasurements, measurementConfig, onChangeField, comments }: SlotMeasurementProps) => {
  const isWithSampleInfo = React.useMemo(
    () => slotMeasurements.some((measurement) => measurement.samples),
    [slotMeasurements]
  );

  const measurementRowValues: MeasurementRow[] = React.useMemo(() => {
    const groupedMeasurements: Dictionary<SlotMeasurement[]> = groupBy(slotMeasurements, 'address');

    return Object.entries(groupedMeasurements).map(([address, measurements]) => ({
      address,
      measurements,
      samples: isWithSampleInfo ? measurements[0]?.samples : undefined
    }));
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
              className: 'text-wrap',
              cellClassName: 'text-wrap',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <div className="grid grid-cols-1 text-wrap">
                    {row.original.samples?.map((sample) => {
                      return (
                        <label className="py-1" key={sample.id}>
                          {sample.tissue.externalName}
                        </label>
                      );
                    })}
                  </div>
                );
              }
            },
            {
              Header: 'Section Number',
              id: 'sectionNumber',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <div className="grid grid-cols-1">
                    {row.original.samples?.map((sample) => {
                      return (
                        <label className="py-1" key={sample.id}>
                          {sample.section}
                        </label>
                      );
                    })}
                  </div>
                );
              }
            }
          ]
        : []),
      ...measurementConfig.map((measurementProp, measurementIndex) => {
        return {
          Header: measurementProp.name + ` (${measurementProp.unit})`,
          id: measurementProp.name,
          allCapital: false,
          Cell: ({ row }: { row: Row<MeasurementRow> }) => {
            return measurementProp.readOnly ? (
              <span>{row.original.measurements[0].value}</span>
            ) : (
              <>
                <FormikInput
                  key={row.original.address + measurementProp.name + row.index}
                  data-testid={`${measurementProp.name}-input`}
                  type={'number'}
                  label={''}
                  name={
                    measurementConfig.length > 1
                      ? `slotMeasurements.${row.index * measurementConfig.length + measurementIndex}.value`
                      : `slotMeasurements.${row.index}.value`
                  }
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onChangeField(
                      `slotMeasurements.${row.index * measurementConfig.length + measurementIndex}.value`,
                      e.currentTarget.value
                    );
                  }}
                  validate={measurementProp.validateFunction}
                  min={0}
                  style={{ minWidth: '5em' }}
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
                    name={`slotMeasurements.${row.index * measurementConfig.length}.commentId`}
                    className={'flex'}
                    emptyOption={true}
                    value={row.original.measurements[0].commentId}
                    handleChange={(val) => {
                      onChangeField?.(
                        `slotMeasurements.${row.index * measurementConfig.length}.commentId`,
                        (val as OptionType).value
                      );
                    }}
                    options={selectOptionValues(comments, 'text', 'id')}
                  />
                );
              }
            }
          ]
        : [])
    ];
  }, [comments, onChangeField, isWithSampleInfo, measurementConfig]);

  return (
    <>
      {slotMeasurements && slotMeasurements.length > 0 && (
        <>
          <DataTable
            columns={columns}
            data={measurementRowValues ?? []}
            cellClassName="overflow-hidden whitespace-nowrap hover:overflow-visible text-sm"
          />
        </>
      )}
    </>
  );
};

export default SlotMeasurements;
