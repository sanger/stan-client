import { Form, Formik } from "formik";
import React from "react";
import Heading from "../Heading";
import FormikSelect from "../forms/Select";
import { CommentFieldsFragment, RnaAnalysisLabware } from "../../types/sdk";
import { Row } from "react-table";
import { motion } from "framer-motion";
import DataTable from "../DataTable";
import { useMachine } from "@xstate/react";
import { analysisLabwareMachine } from "./analysisLabware.machine";
import { enumValue } from "../../lib/helpers";

type RecordAnalysisProps = {
  barcodes: string[];
  comments: CommentFieldsFragment[];
  analysisLabwares: RnaAnalysisLabware[];
};
export enum AnalysisType {
  RIN = "RIN",
  DV200 = "DV200",
}

export enum AnalysisMeasurementType {
  RIN = "RIN",
  DV200 = "DV200",
  DV200_LOWER = "DV200 lower",
  DV200_UPPER = "DV200 upper",
}
export enum DV200ValueTypes {
  SINGLE_VALUE_TYPE = "Value",
  RANGE_VALUE_TYPE = "Range",
}

export default function AnalysisLabware({
  barcodes,
  comments,
}: RecordAnalysisProps) {
  const defaultLabwareValues = barcodes.map((barcode) => {
    return {
      barcode: barcode,
      measurements: [{ name: AnalysisType.RIN, value: "" }],
    };
  });

  const [current, send] = useMachine(() =>
    analysisLabwareMachine.withContext({
      analysisLabwares: defaultLabwareValues,
      analysisType: AnalysisType.RIN,
    })
  );
  const { analysisType, analysisLabwares } = current.context;

  const handleOnChange = (
    barcode: string,
    fieldname: string,
    value: string,
    measurementType?: string
  ) => {
    debugger;
    send({
      type: "UPDATE_LABWARE_DATA",
      labware: {
        barcode: barcode,
        field: fieldname,
        value: value,
        measurementType: measurementType,
      },
    });
  };

  const MeasurementInput = ({
    barcode,
    value,
    measurementType,
  }: {
    barcode: string;
    value: string;
    measurementType: string;
  }) => {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) =>
          handleOnChange(
            barcode,
            "measurements",
            e.currentTarget.value,
            measurementType
          )
        }
        step={isRange(measurementType) ? "1" : ".01"}
      />
    );
  };
  const isRange = (measurementType: string) => {
    return (
      measurementType === AnalysisMeasurementType.DV200_LOWER ||
      measurementType === AnalysisMeasurementType.DV200_UPPER
    );
  };

  const columns = React.useMemo(() => {
    return [
      {
        Header: "Barcode",
        id: "barcode",
        accessor: (labware: RnaAnalysisLabware) => labware.barcode,
      },
      {
        Header: "SGP Number",
        id: "workNumber",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          return (
            <input
              type="text"
              value={row.original.workNumber ?? ""}
              onChange={(e) =>
                handleOnChange(
                  row.original.barcode,
                  "workNumber",
                  e.currentTarget.value
                )
              }
            />
          );
        },
      },
      {
        Header: `${analysisType} Value`,
        id: "analysisType",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          return (
            <div className="flex flex-row">
              <div className={"p-2"}>
                {analysisType !== AnalysisType.RIN && (
                  <select
                    onChange={(e) =>
                      send({
                        type: "INIT_MEASUREMENT_TYPE",
                        value: e.currentTarget.value,
                      })
                    }
                  >
                    {Object.keys(DV200ValueTypes).map((key) => (
                      <option value={key} key={key}>
                        {enumValue(DV200ValueTypes, key)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className={"p-2"}>
                <MeasurementInput
                  barcode={row.original.barcode}
                  value={row.original.measurements[0].value}
                  measurementType={row.original.measurements[0].name}
                />
              </div>
              <div className={"p-2"}>
                {isRange(row.original.measurements[0].name) && (
                  <MeasurementInput
                    barcode={row.original.barcode}
                    value={
                      row.original.measurements.length > 1
                        ? row.original.measurements[1].value
                        : ""
                    }
                    measurementType={AnalysisMeasurementType.DV200_UPPER}
                  />
                )}
              </div>
            </div>
          );
        },
      },
      {
        Header: "Comment",
        id: "comment",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          return (
            <select>
              {comments.map((comment) => (
                <option value={comment.id} key={comment.id}>
                  {comment.text}
                </option>
              ))}
              onChange=
              {(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleOnChange(
                  row.original.barcode,
                  "comment",
                  e.currentTarget.value
                )
              }
            </select>
          );
        },
      },
    ];
  }, [analysisType]);

  return (
    <div className="max-w-screen-xl mx-auto">
      <Heading level={3}> Analysis</Heading>
      <Formik initialValues={barcodes} onSubmit={() => {}}>
        <Form>
          <div className="md:grid mt-4 md:grid-cols-2 md:space-y-0 md:gap-4 space-y-2">
            <div className="">
              <FormikSelect
                label={"Type"}
                name={"type"}
                emptyOption={false}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  send({
                    type: "UPDATE_ANALYSIS_TYPE",
                    value: e.currentTarget.value,
                  })
                }
              >
                {Object.values(AnalysisType).map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </FormikSelect>
            </div>
            <div className="">
              <FormikSelect
                label={"Comment"}
                name={"comment"}
                emptyOption={false}
              >
                {comments.map((comment) => (
                  <option value={comment.id} key={comment.id}>
                    {comment.text}
                  </option>
                ))}
              </FormikSelect>
            </div>
          </div>
        </Form>
      </Formik>
      {barcodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <DataTable columns={columns} data={analysisLabwares} />
        </motion.div>
      )}
    </div>
  );
}
