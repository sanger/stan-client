import React from "react";
import { SlotMeasurementRequest } from "../../types/sdk";
import { Row } from "react-table";
import DataTable from "../DataTable";
import FormikInput from "../forms/Input";

type SlotMeasurementProps = {
  slotMeasurements: SlotMeasurementRequest[];
  measurementName: string;
  onChangeMeasurement: (address: string, value: string) => void;
  validateValue?: (value: string) => void;
};

/**
 * Component to display SlotMeasurements as a table
 * @param slotMeasurements - SlotMeasurement data
 * @param measurementName  - name of the measurement
 * @param onChangeMeasurement - callback for measurementValue
 * @param validateValue - validation to run when measurement Value changes
 *
 */

const SlotMeasurements = ({
  slotMeasurements,
  measurementName,
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
        Header: `${measurementName}`,
        id: measurementName,
        Cell: ({ row }: { row: Row<SlotMeasurementRequest> }) => {
          return (
            <FormikInput
              className={"rounded-md"}
              data-testid={"measurementValue"}
              type={"number"}
              label={""}
              name={`slotMeasurements.${row.index}.value`}
              onChange={(e: any) => {
                onChangeMeasurement(
                  row.original.address,
                  e.currentTarget.value
                );
              }}
              value={
                row.original.value !== "" ? Number(row.original.value) : ""
              }
              validate={() =>
                validateValue ? validateValue(row.original.value) : ""
              }
              min={0}
            />
          );
        },
      },
    ];
  }, [measurementName, onChangeMeasurement, validateValue]);

  return (
    <>
      {slotMeasurements && slotMeasurements.length > 0 && (
        <DataTable columns={columns} data={slotMeasurements} />
      )}
    </>
  );
};

export default SlotMeasurements;
