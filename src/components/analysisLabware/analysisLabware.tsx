import { Form, Formik } from "formik";
import React, { useCallback } from "react";
import Heading from "../Heading";
import FormikSelect from "../forms/Select";
import { CommentFieldsFragment, RnaAnalysisLabware } from "../../types/sdk";
import { Row } from "react-table";
import { motion } from "framer-motion";
import DataTable from "../DataTable";
import { useMachine } from "@xstate/react";
import { analysisLabwareMachine } from "./analysisLabware.machine";
import {
  AnalysisMeasurementType,
  measurementColumn,
} from "./measurementColumn";
import { objectKeys } from "../../lib/helpers";
import WorkNumberSelect from "../WorkNumberSelect";

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
  RIN = "RIN analysis",
  DV200 = "DV200 analysis",
}

export default function AnalysisLabware({
  barcodes,
  comments,
  onChangeLabwareData,
}: RecordAnalysisProps) {
  const defaultLabwareValues = barcodes.map((barcode) => {
    return {
      barcode: barcode,
      measurements: [{ name: AnalysisMeasurementType.RIN, value: "" }],
      workNumber: "",
    };
  });

  const workNumberCommon = React.useRef("");

  const memoAnalysisLabwareMachine = React.useMemo(() => {
    return analysisLabwareMachine.withContext({
      analysisLabwares: defaultLabwareValues,
      operationType: OperationType.RIN,
    });
  }, [defaultLabwareValues]);

  const [current, send] = useMachine(() => memoAnalysisLabwareMachine);
  const { operationType, analysisLabwares } = current.context;

  React.useEffect(() => {
    onChangeLabwareData(operationType, analysisLabwares);
  }, [analysisLabwares, onChangeLabwareData, operationType]);

  const handleOnChange = useCallback(
    (
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
    },
    [send]
  );
  const onChangeMeasurementCategory = useCallback(
    (barcode: string, value: string) => {
      send({ type: "UPDATE_MEASUREMENT_TYPE", barcode: barcode, value: value });
    },
    [send]
  );

  const onChangeMeasurementValue = useCallback(
    (barcode: string, value: string, type: string) => {
      handleOnChange(barcode, "measurements", value, type);
    },
    [handleOnChange]
  );

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
            <WorkNumberSelect
              onWorkNumberChange={(workNumber) =>
                handleOnChange(
                  row.original.barcode,
                  "workNumber",
                  workNumber ?? ""
                )
              }
              workNumber={
                row.original.workNumber ? row.original.workNumber : ""
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
          return (
            <select
              className={"rounded-md"}
              value={row.original.commentId || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleOnChange(
                  row.original.barcode,
                  "comment",
                  e.currentTarget.value
                )
              }
            >
              <option value="" />
              {comments.map((comment) => (
                <option value={comment.id} key={comment.id}>
                  {comment.text}
                </option>
              ))}
            </select>
          );
        },
      },
    ];
  }, [
    operationType,
    comments,
    handleOnChange,
    onChangeMeasurementCategory,
    onChangeMeasurementValue,
  ]);

  return (
    <div className="max-w-screen-xl mx-auto">
      <Heading level={3}> Analysis</Heading>
      <Formik initialValues={barcodes} onSubmit={() => {}}>
        <Form>
          <div className="md:grid mt-4 md:grid-cols-3 md:space-y-0 md:gap-4 space-y-2 mb-8">
            <div className="">
              <FormikSelect
                label={"Type"}
                data-testid={"analysisType"}
                name={"type"}
                emptyOption={false}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  send({
                    type: "UPDATE_ANALYSIS_TYPE",
                    value: e.currentTarget.value,
                  })
                }
              >
                {objectKeys(OperationType).map((type) => (
                  <option value={OperationType[type]} key={type}>
                    {type}
                  </option>
                ))}
              </FormikSelect>
            </div>
            <div className="mt-4">
              <div>SGP Number</div>
              <WorkNumberSelect
                onWorkNumberChange={(workNumber) => {
                  send({
                    type: "UPDATE_ALL_WORKNUMBERS",
                    workNumber: workNumber ?? "",
                  });
                  workNumberCommon.current = workNumber ?? "";
                }}
                workNumber={workNumberCommon.current}
              />
            </div>
            <div className="">
              <FormikSelect
                label={"Comment"}
                name={"comment"}
                data-testid={"comment"}
                emptyOption={true}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  send({
                    type: "UPDATE_ALL_COMMENTS_TYPE",
                    commentId: e.currentTarget.value,
                  });
                }}
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
