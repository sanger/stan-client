import React from 'react';
import { CommentFieldsFragment, SampleFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { Dictionary, groupBy } from 'lodash';
import CustomReactSelect from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import { SlotMeasurementRequestForm } from '../visiumQC/CDNAConentration';

export type MeasurementConfigProps = {
  measurementType: string[];
  name: string;
  unit?: string;
  stepIncrement?: string;
  initialMeasurementVal?: string;
  readOnly?: boolean;
};

export interface SlotMeasurement extends SlotMeasurementRequestForm {
  samples?: SampleFieldsFragment[];
}
export type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurement[];
  measurementConfig: MeasurementConfigProps[];
  comments?: CommentFieldsFragment[];
  libraryConcentrationSizeRange?: CommentFieldsFragment[];
};

type MeasurementRow = {
  address: string;
  measurements: SlotMeasurementRequestForm[];
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

const SlotMeasurements = ({
  slotMeasurements,
  measurementConfig,
  comments,
  libraryConcentrationSizeRange
}: SlotMeasurementProps) => {
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
        const unit = measurementProp.unit ? ` (${measurementProp.unit})` : '';
        return {
          Header: measurementProp.name + unit,
          id: measurementProp.name,
          allCapital: false,
          Cell: ({ row }: { row: Row<MeasurementRow> }) => {
            return measurementProp.readOnly ? (
              <span>{row.original.measurements[0].value}</span>
            ) : (
              <div>
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
                  min={0}
                  style={{ minWidth: '5em' }}
                  step={measurementProp.stepIncrement}
                />
              </div>
            );
          }
        };
      }),
      ...(libraryConcentrationSizeRange
        ? [
            {
              Header: 'Size Range',
              id: 'sizeRange',
              Cell: ({ row }: { row: Row<MeasurementRow> }) => {
                return (
                  <CustomReactSelect
                    label={''}
                    dataTestId={`sizeRange${row.index}`}
                    name={`slotMeasurements.${row.index * measurementConfig.length}.sizeRangeId`}
                    className="min-w-32"
                    emptyOption={true}
                    value={row.original.measurements[0].sizeRangeId}
                    options={selectOptionValues(libraryConcentrationSizeRange, 'text', 'id')}
                  />
                );
              }
            }
          ]
        : []),
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
                    className="min-w-32"
                    emptyOption={true}
                    options={selectOptionValues(comments, 'text', 'id')}
                  />
                );
              }
            }
          ]
        : [])
    ];
  }, [comments, isWithSampleInfo, measurementConfig, libraryConcentrationSizeRange]);

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
