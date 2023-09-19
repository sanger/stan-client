import React from 'react';
import { CommentFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { selectOptionValues } from '../forms';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { Dictionary, groupBy } from 'lodash';

type MeasurementProps = {
  name: string;
  stepIncrement: string;
  validateValue?: (value: string) => void;
};
export type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurementRequest[];
  measurements: MeasurementProps[];
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

const SlotMeasurements = ({ slotMeasurements, measurements, onChangeField, comments }: SlotMeasurementProps) => {
  /**concatenate all mesaurements if there are multiple measurements */
  const memoRows = React.useMemo(() => {
    const groupedMeasurements: Dictionary<SlotMeasurementRequest[]> = groupBy(slotMeasurements, 'address');
    return Object.keys(groupedMeasurements).map((address) => {
      return {
        address,
        measurements: groupedMeasurements[address]
      };
    });
  }, [slotMeasurements]);

  const getIndex = React.useCallback(
    (address: string, measurementName: string) => {
      return slotMeasurements.findIndex((val) => val.address === address && val.name === measurementName);
    },
    [slotMeasurements]
  );
  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Address',
        id: 'address',
        accessor: (measurement: MeasurementRow) => measurement.address
      },
      ...measurements.map((measurement, index) => {
        return {
          Header: setMeasurementNameTableTitle(measurement.name),
          id: measurement.name,
          allCapital: false,
          Cell: ({ row }: { row: Row<MeasurementRow> }) => {
            return (
              <>
                <FormikInput
                  key={row.original.address + index + row.index}
                  data-testid={`${measurement.name}-input`}
                  type={'number'}
                  label={''}
                  name={
                    measurements.length > 1
                      ? `slotMeasurements.${getIndex(row.original.address, measurement.name)}.value`
                      : `slotMeasurements.${row.index}.value`
                  }
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onChangeField(
                      measurements.length > 1
                        ? `slotMeasurements.${getIndex(row.original.address, measurement.name)}.value`
                        : `slotMeasurements.${row.index}.value`,
                      e.currentTarget.value
                    );
                  }}
                  value={
                    slotMeasurements.find(
                      (val) => val.address === row.original.address && val.name === measurement.name
                    )?.value
                  }
                  validate={measurement.validateValue}
                  min={0}
                  step={measurement.stepIncrement}
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
                    value={slotMeasurements[row.index].commentId}
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
  }, [measurements, onChangeField, comments, getIndex, slotMeasurements]);

  return <>{slotMeasurements && slotMeasurements.length > 0 && <DataTable columns={columns} data={memoRows} />}</>;
};

export default SlotMeasurements;
