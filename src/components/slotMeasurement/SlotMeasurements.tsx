import React from 'react';
import { CommentFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import FormikInput from '../forms/Input';
import { selectOptionValues } from '../forms';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurementRequest[];
  measurementName: string;
  stepIncrement: string;
  comments?: CommentFieldsFragment[];
  onChangeMeasurement: (address: string, fieldName: string, value: string) => void;
  validateValue?: (value: string) => void;
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
 * @param measurementName  - Name of the measurement
 * @param stepIncrement - Measurement value increment step
 * @param comments - List of (concentration) comments to select from
 * @param onChangeMeasurement - Callback for measurementValue
 * @param validateValue - Function validate the format of data in value field
 *
 */

const SlotMeasurements = ({
  slotMeasurements,
  measurementName,
  stepIncrement,
  comments,
  onChangeMeasurement,
  validateValue
}: SlotMeasurementProps) => {
  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Address',
        id: 'address',
        accessor: (measurement: SlotMeasurementRequest) => measurement.address
      },
      {
        Header: setMeasurementNameTableTitle(measurementName),
        id: measurementName,
        allCapital: false,
        Cell: ({ row }: { row: Row<SlotMeasurementRequest> }) => {
          return (
            <FormikInput
              className={'rounded-md'}
              data-testid={`measurementValue${row.index}`}
              type={'number'}
              label={''}
              name={`slotMeasurements.${row.index}.value`}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                onChangeMeasurement(row.original.address, `slotMeasurements.${row.index}.value`, e.currentTarget.value);
              }}
              validate={validateValue}
              min={0}
              step={stepIncrement}
            />
          );
        }
      },
      ...(comments?.length
        ? [
            {
              Header: 'Comments',
              id: 'Comments',
              Cell: ({ row }: { row: Row<SlotMeasurementRequest> }) => {
                return (
                  <CustomReactSelect
                    label={''}
                    dataTestId={`comments${row.index}`}
                    name={`slotMeasurements.${row.index}.commentId`}
                    className={'flex'}
                    emptyOption={true}
                    handleChange={(val) => {
                      onChangeMeasurement(
                        row.original.address,
                        `slotMeasurements.${row.index}.commentId`,
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
  }, [measurementName, onChangeMeasurement, validateValue, stepIncrement, comments]);

  return (
    <>{slotMeasurements && slotMeasurements.length > 0 && <DataTable columns={columns} data={slotMeasurements} />}</>
  );
};

export default SlotMeasurements;
