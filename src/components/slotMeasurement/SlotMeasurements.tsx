import React from "react";
import { SlotMeasurementRequest } from "../../types/sdk";
import { Row } from "react-table";
import DataTable from "../DataTable";
import FormikInput from "../forms/Input";

type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurementRequest[];
  measurementName: string;
  stepIncrement: string;
  onChangeMeasurement: (
    address: string,
    fieldName: string,
    value: string
  ) => void;
  validateValue?: (value: string) => void;
};

/**
 * Component to display SlotMeasurements as a table with two columns - slot address & measurement value
 *
 * @param slotMeasurements - SlotMeasurement data
 * @param measurementName  - Name of the measurement
 * @param stepIncrement - Measurement value increment step
 * @param onChangeMeasurement - Callback for measurementValue
 * @param validateValue - Function validate the format of data in value field
 *
 */

const SlotMeasurements = ({
  slotMeasurements,
  measurementName,
  stepIncrement,
  onChangeMeasurement,
  validateValue,
}: SlotMeasurementProps) => {
  const columns = React.useMemo(() => {
    return [
      {
        Header: "Address",
        id: "address",
        accessor: (measurement: SlotMeasurementRequest) => measurement.address,
      },
      {
        Header: measurementName,
        id: measurementName,
        Cell: ({ row }: { row: Row<SlotMeasurementRequest> }) => {
          return (
            <FormikInput
              className={"rounded-md"}
              data-testid={`measurementValue${row.index}`}
              type={"number"}
              label={""}
              name={`slotMeasurements.${row.index}.value`}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                onChangeMeasurement(
                  row.original.address,
                  `slotMeasurements.${row.index}.value`,
                  e.currentTarget.value
                );
              }}
              validate={validateValue}
              min={0}
              step={stepIncrement}
            />
          );
        },
      },
    ];
  }, [measurementName, onChangeMeasurement, validateValue, stepIncrement]);

  return (
    <>
      {slotMeasurements && slotMeasurements.length > 0 && (
        <DataTable columns={columns} data={slotMeasurements} />
      )}
    </>
  );
};

export default SlotMeasurements;
