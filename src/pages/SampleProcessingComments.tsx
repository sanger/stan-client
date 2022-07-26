import React, { ChangeEvent } from "react";

import AppShell from "../components/AppShell";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import { reload, stanCore } from "../lib/sdk";
import variants from "../lib/motionVariants";
import { motion } from "framer-motion";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Warning from "../components/notifications/Warning";
import Heading from "../components/Heading";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import FormikSelect from "../components/forms/Select";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import GrayBox, { Sidebar } from "../components/layouts/GrayBox";
import PinkButton from "../components/buttons/PinkButton";
import { Row } from "react-table";
import MutedText from "../components/MutedText";

import { FormikErrorMessage } from "../components/forms";
import {
  GetSampleProcessingCommentsInfoQuery,
  LabwareFieldsFragment,
  RecordSampleProcessingCommentsMutation,
  SampleProcessingCommentRequest,
} from "../types/sdk";

interface SampleProcessingCommentsParams {
  sampleCommentsInfo: GetSampleProcessingCommentsInfoQuery;
}

type SampleCommentsFormData = Required<SampleProcessingCommentRequest> & {
  /**Solution to apply to all labware**/
  applyAllComment: string;
};
const SampleProcessingComments: React.FC<SampleProcessingCommentsParams> = ({
  sampleCommentsInfo,
}: SampleProcessingCommentsParams) => {
  const formMachine = React.useMemo(() => {
    return createFormMachine<
      SampleProcessingCommentRequest,
      RecordSampleProcessingCommentsMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordSampleProcessingComments({
            request: {
              labware: e.values.labware,
            },
          });
        },
      },
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);

  const { serverError, submissionResult } = current.context;

  function buildValidationSchema(): Yup.AnyObjectSchema {
    return Yup.object().shape({
      labware: Yup.array()
        .of(
          Yup.object().shape({
            barcode: Yup.string().required("Barcode is a required field"),
            commentId: Yup.number().required("Comment is a required field"),
          })
        )
        .required("At least one labware must be scanned")
        .min(1, "At least one labware must be scanned"),
      applyAllComment: Yup.string().optional(),
    });
  }

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const commentsColumn = React.useMemo(() => {
    return {
      Header: "Comments",
      id: "comments",
      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
        return (
          <div className={"min-w-25"}>
            <FormikSelect
              name={`labware.${row.index}.commentId`}
              label={""}
              emptyOption
            >
              {sampleCommentsInfo.comments.map((comment) => (
                <option value={comment.id} key={comment.id}>
                  {comment.text}
                </option>
              ))}
            </FormikSelect>
          </div>
        );
      },
    };
  }, [sampleCommentsInfo]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sample Processing Comments</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className={"max-w-screen-xl mx-auto"}>
          {sampleCommentsInfo.comments && (
            <Formik<SampleCommentsFormData>
              initialValues={{
                labware: [],
                applyAllComment: "",
              }}
              onSubmit={async (values) => {
                send({
                  type: "SUBMIT_FORM",
                  values,
                });
              }}
              validationSchema={buildValidationSchema()}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <GrayBox>
                    <motion.div
                      variants={variants.fadeInParent}
                      initial={"hidden"}
                      animate={"visible"}
                      exit={"hidden"}
                      className="md:w-2/3 space-y-10"
                    >
                      {serverError && <Warning error={serverError} />}

                      <motion.div
                        variants={variants.fadeInWithLift}
                        className="space-y-4"
                      >
                        <Heading level={3}>Labware</Heading>
                        <LabwareScanner
                          /***
                          Handlers to update the form data whenever labware list changes
                          ***/
                          onChange={(labware) => {
                            labware.forEach((lw, indx) =>
                              setFieldValue(
                                `labware.${indx}.barcode`,
                                lw.barcode
                              )
                            );
                          }}
                          onAdd={() => {
                            setFieldValue(
                              `labware.${values.labware.length}.commentId`,
                              values.applyAllComment ?? -1
                            );
                          }}
                          onRemove={(labware) => {
                            const updatedLabware = values.labware.filter(
                              (lw) => lw.barcode !== labware.barcode
                            );
                            setFieldValue("labware", updatedLabware);
                          }}
                        >
                          {values.labware.length === 0 && (
                            <FormikErrorMessage name={"labware"} />
                          )}
                          <motion.div variants={variants.fadeInWithLift}>
                            {values.labware.length > 0 && (
                              <motion.div
                                variants={variants.fadeInWithLift}
                                className={"pt-10 pb-5"}
                              >
                                <FormikSelect
                                  name={"applyAllComment"}
                                  label={"Comment"}
                                  emptyOption
                                  className={"w-1/2"}
                                  onChange={(
                                    evt: ChangeEvent<HTMLSelectElement>
                                  ) => {
                                    setFieldValue(
                                      "applyAllComment",
                                      evt.currentTarget.value
                                    );
                                    values.labware.forEach((lw, indx) =>
                                      setFieldValue(
                                        `labware.${indx}.commentId`,
                                        evt.currentTarget.value
                                      )
                                    );
                                  }}
                                >
                                  {sampleCommentsInfo.comments.map(
                                    (comment) => (
                                      <option
                                        value={comment.id}
                                        key={comment.id}
                                      >
                                        {comment.text}
                                      </option>
                                    )
                                  )}
                                </FormikSelect>
                                <MutedText>
                                  Comment selected will be applied to all
                                  labware
                                </MutedText>{" "}
                              </motion.div>
                            )}
                            <LabwareScanTable
                              columns={[
                                labwareScanTableColumns.barcode(),
                                commentsColumn,
                                labwareScanTableColumns.donorId(),
                                labwareScanTableColumns.tissueType(),
                                labwareScanTableColumns.labwareType(),
                                labwareScanTableColumns.fixative(),
                              ]}
                            />
                          </motion.div>
                        </LabwareScanner>
                      </motion.div>
                    </motion.div>
                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>
                      <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                        <p className="my-3 text-white-800 text-xs leading-normal">
                          Once{" "}
                          <span className="font-bold text-white-800">
                            all labware
                          </span>{" "}
                          have been scanned and{" "}
                          <span className="font-bold text-white-800">
                            comments
                          </span>{" "}
                          selected for all, click
                          <span className="font-bold text-white-800">
                            {" "}
                            Submit
                          </span>{" "}
                          to record comments.
                        </p>
                      </div>
                      <PinkButton type="submit" className="sm:w-full">
                        Submit
                      </PinkButton>
                    </Sidebar>

                    <OperationCompleteModal
                      show={submissionResult !== undefined}
                      message={
                        "Sample processing comments recorded on all labware"
                      }
                      onReset={reload}
                    >
                      <p>
                        If you wish to start the process again, click the "Reset
                        Form" button. Otherwise you can return to the Home
                        screen.
                      </p>
                    </OperationCompleteModal>
                  </GrayBox>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SampleProcessingComments;
