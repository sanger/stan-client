import React from "react";
import {
  GetFfpeProcessingInfoQuery,
  PerformFfpeProcessingMutation,
  FfpeProcessingRequest,
} from "../types/sdk";
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
import { FormikErrorMessage } from "../components/forms";
import FormikSelect from "../components/forms/Select";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import WorkNumberSelect from "../components/WorkNumberSelect";
import GrayBox, { Sidebar } from "../components/layouts/GrayBox";
import PinkButton from "../components/buttons/PinkButton";

interface FFPEProcessingParams {
  ffPeInfo: GetFfpeProcessingInfoQuery;
}

const FFPEProcessing: React.FC<FFPEProcessingParams> = ({
  ffPeInfo,
}: FFPEProcessingParams) => {
  const [current, send] = useMachine(
    createFormMachine<
      FfpeProcessingRequest,
      PerformFfpeProcessingMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.PerformFFPEProcessing({
            request: e.values,
          });
        },
      },
    })
  );

  const { serverError, submissionResult } = current.context;

  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      workNumber: Yup.string().required("SGP Number is a required field"),
      barcodes: Yup.array()
        .of(Yup.string())
        .required("Labware field must have at least 1 item")
        .min(1, "Labware field must have at least 1 item"),
      commentId: Yup.number()
        .required("Program Type is a required field")
        .min(0, "Program Type is a required field"),
    });
  }

  const getComment = (commentId: number) => {
    if (commentId < 0) return "";
    const comment = ffPeInfo.comments.find(
      (comment) => comment.id === commentId
    );
    return comment !== undefined ? comment.text : "";
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>FFPE Processing</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className={"max-w-screen-xl mx-auto"}>
          {ffPeInfo && (
            <Formik<FfpeProcessingRequest>
              initialValues={{
                workNumber: "",
                barcodes: [],
                commentId: -1,
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
                        <Heading level={3}>SGP Number</Heading>
                        <p className="mt-2">
                          Please select an SGP number to associate with FFPE
                          processing.
                        </p>
                        <motion.div
                          variants={variants.fadeInWithLift}
                          className="mt-4 md:w-1/2"
                        >
                          <WorkNumberSelect
                            onWorkNumberChange={(workNumber) => {
                              setFieldValue("workNumber", workNumber);
                            }}
                            name={"workNumber"}
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        variants={variants.fadeInWithLift}
                        className="space-y-4"
                      >
                        <Heading level={3}>Labware</Heading>

                        <LabwareScanner
                          onChange={(labwares) =>
                            setFieldValue(
                              "barcodes",
                              labwares.map((lw) => lw.barcode)
                            )
                          }
                        >
                          <LabwareScanTable
                            columns={[
                              labwareScanTableColumns.barcode(),
                              labwareScanTableColumns.donorId(),
                              labwareScanTableColumns.tissueType(),
                              labwareScanTableColumns.labwareType(),
                              labwareScanTableColumns.fixative(),
                            ]}
                          />
                        </LabwareScanner>
                        <FormikErrorMessage name={"barcodes"} />
                      </motion.div>
                      <motion.div
                        variants={variants.fadeInWithLift}
                        className="space-y-4"
                      >
                        <Heading level={3}>Program Type</Heading>
                        <FormikSelect
                          name={"commentId"}
                          label={""}
                          emptyOption
                          className={"w-1/2"}
                        >
                          {ffPeInfo.comments.map((comment) => (
                            <option value={comment.id} key={comment.id}>
                              {comment.text}
                            </option>
                          ))}
                        </FormikSelect>
                      </motion.div>
                    </motion.div>
                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>

                      {values.workNumber ? (
                        <p>
                          The selected SGP number is{" "}
                          <span className="font-semibold">
                            {values.workNumber}
                          </span>
                          .
                        </p>
                      ) : (
                        <p className="text-sm italic">
                          No SGP number selected.
                        </p>
                      )}
                      {values.commentId >= 0 ? (
                        <p>
                          The selected program is{" "}
                          <span className="font-semibold">
                            {getComment(Number(values.commentId))}
                          </span>
                          .
                        </p>
                      ) : (
                        <p className="text-sm italic">No Program selected.</p>
                      )}

                      <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                        <p className="my-3 text-white-800 text-xs leading-normal">
                          Once{" "}
                          <span className="font-bold text-white-800">
                            all labware
                          </span>{" "}
                          have been scanned and a program is selected, click
                          <span className="font-bold text-white-800">
                            {" "}
                            Submit
                          </span>{" "}
                          to record the type of processing cycle run on the
                          sample.
                        </p>
                      </div>
                      <PinkButton type="submit" className="sm:w-full">
                        Submit
                      </PinkButton>
                    </Sidebar>

                    <OperationCompleteModal
                      show={submissionResult !== undefined}
                      message={"FFPE processing type recored on all labware"}
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

export default FFPEProcessing;
