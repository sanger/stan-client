import { OperationType } from "./analysisLabware";
import { enumValue } from "../../lib/helpers";
import React from "react";
import { RnaAnalysisLabware, StringMeasurement } from "../../types/sdk";
import { Row } from "react-table";

export enum AnalysisMeasurementType {
  RIN = "RIN",
  DV200 = "DV200",
  DV200_LOWER = "DV200 lower",
  DV200_UPPER = "DV200 upper",
}
export enum MeasurementValueCategory {
  SINGLE_VALUE_TYPE = "Value",
  RANGE_VALUE_TYPE = "Range",
  NA_TYPE = "N/a",
}
export const measurementColumn = (
  operationType: string,
  onChangeMeasurementCategory: (barcode: string, value: string) => void,
  onChangeMeasurementValue: (
    barcode: string,
    value: string,
    type: string
  ) => void
) => {
  const getValueCategoryKeys = (operationType: string) => {
    if (operationType === OperationType.DV200) {
      return Object.keys(MeasurementValueCategory);
    } else {
      return Object.keys(MeasurementValueCategory).filter(
        (key) =>
          enumValue(MeasurementValueCategory, key) !=
          MeasurementValueCategory.RANGE_VALUE_TYPE
      );
    }
  };

  const MeasurementCategoryTypeSelect = ({
    barcode,
    operationType,
    onChangeMeasurementCategory,
  }: {
    barcode: string;
    operationType: string;
    onChangeMeasurementCategory: (eventType: string, value: string) => void;
  }) => {
    return (
      <select
        onChange={(e) =>
          onChangeMeasurementCategory(
            barcode,
            e.currentTarget.value === MeasurementValueCategory.NA_TYPE
              ? ""
              : e.currentTarget.value
          )
        }
      >
        {getValueCategoryKeys(operationType).map((key) => (
          <option value={enumValue(MeasurementValueCategory, key)} key={key}>
            {enumValue(MeasurementValueCategory, key)}
          </option>
        ))}
      </select>
    );
  };

  const isRangeType = (measurementType: string) => {
    return (
      measurementType === AnalysisMeasurementType.DV200_LOWER ||
      measurementType === AnalysisMeasurementType.DV200_UPPER
    );
  };

  const MeasurementInput = ({
    barcode,
    measurement,
    onChangeMeasurementValue,
    disabled,
  }: {
    barcode: string;
    measurement: StringMeasurement;
    onChangeMeasurementValue: (
      barcode: string,
      value: string,
      type: string
    ) => void;
    disabled?: boolean;
  }) => {
    return (
      <input
        className={`rounded-sm ${disabled && "bg-gray-200 border-gray-50"}`}
        type="number"
        value={measurement.value}
        defaultValue={""}
        onChange={(e) =>
          onChangeMeasurementValue(
            barcode,
            e.currentTarget.value,
            measurement.name
          )
        }
        disabled={disabled}
        step={isRangeType(measurement.name) ? "1" : ".1"}
        min={0}
      />
    );
  };

  return {
    Header: `${operationType} Value`,
    id: "analysisType",
    columns: [
      {
        Header: "Type",
        id: "type",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          return (
            <MeasurementCategoryTypeSelect
              barcode={row.original.barcode}
              operationType={operationType}
              onChangeMeasurementCategory={onChangeMeasurementCategory}
            />
          );
        },
      },
      {
        Header: "Value",
        id: "range",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          return (
            <div className={"flex flex-row border-solid"}>
              <div className="flex flex-col mr-4">
                {isRangeType(row.original.measurements[0].name) && (
                  <label className="text-gray-400 text-xs ">
                    Lower bound (%)
                  </label>
                )}
                <MeasurementInput
                  barcode={row.original.barcode}
                  measurement={row.original.measurements[0]}
                  onChangeMeasurementValue={onChangeMeasurementValue}
                  disabled={row.original.measurements[0].name === ""}
                />
              </div>
              {isRangeType(row.original.measurements[0].name) && (
                <div className="flex flex-col mr-4">
                  {isRangeType(row.original.measurements[0].name) && (
                    <label className="text-gray-400 text-xs ">
                      Upper bound (%)
                    </label>
                  )}
                  <MeasurementInput
                    barcode={row.original.barcode}
                    measurement={row.original.measurements[1]}
                    onChangeMeasurementValue={onChangeMeasurementValue}
                  />
                </div>
              )}
            </div>
          );
        },
      },
    ],
  };
};
