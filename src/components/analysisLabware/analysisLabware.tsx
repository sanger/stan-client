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
import { measurementColumn } from "./measurementColumn";

type RecordAnalysisProps = {
  barcodes: string[];
  comments: CommentFieldsFragment[];
  analysisLabwares: RnaAnalysisLabware[];
  onChangeLabwareData: (
    operationType: string,
    labwares: RnaAnalysisLabware[]
  ) => void;
};
export enum OperationType {
  RIN = "RIN",
  DV200 = "DV200",
}

export default function AnalysisLabware({
  barcodes,
  comments,
  onChangeLabwareData,
}: RecordAnalysisProps) {
  const defaultLabwareValues = barcodes.map((barcode) => {
    return {
      barcode: barcode,
      measurements: [{ name: OperationType.RIN, value: "" }],
    };
  });

  const [current, send] = useMachine(() =>
    analysisLabwareMachine.withContext({
      analysisLabwares: defaultLabwareValues,
      operationType: OperationType.RIN,
    })
  );
  const { operationType, analysisLabwares } = current.context;

  React.useEffect(() => {
    onChangeLabwareData(operationType, analysisLabwares);
  }, [analysisLabwares]);

  const handleOnChange = (
    barcode: string,
    fieldname: string,
    value: string,
    measurementType?: string
  ) => {
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
  const onChangeMeasurementCategory = (barcode: string, value: string) => {
    debugger;
    send({ type: "UPDATE_MEASUREMENT_TYPE", barcode: barcode, value: value });
  };
  const onChangeMeasurementValue = (
    barcode: string,
    value: string,
    type: string
  ) => {
    handleOnChange(barcode, "measurements", value, type);
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
      measurementColumn(
        operationType,
        onChangeMeasurementCategory,
        onChangeMeasurementValue
      ),
      {
        Header: "Comment",
        id: "comment",
        Cell: ({ row }: { row: Row<RnaAnalysisLabware> }) => {
          debugger;
          return (
            <select value={row.original.commentId ?? ""}>
              {comments.map((comment) => (
                <option
                  value={comment.id}
                  key={comment.id}
                  selected={comment.id === row.original.commentId}
                >
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
  }, [operationType]);

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
                {Object.values(OperationType).map((type) => (
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  send({
                    type: "UPDATE_ALL_COMMENTS_TYPE",
                    commentId: e.currentTarget.value,
                  })
                }
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
          className="mt-4"
        >
          <DataTable columns={columns} data={analysisLabwares} />
        </motion.div>
      )}
    </div>
  );
}
