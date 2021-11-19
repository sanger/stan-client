import React from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import WorkNumberSelect from "../components/WorkNumberSelect";
import { Form, Formik } from "formik";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import { VisiumAnalysisMutation, VisiumAnalysisRequest } from "../types/sdk";
import BlueButton from "../components/buttons/BlueButton";
import { reload, stanCore } from "../lib/sdk";
import * as Yup from "yup";
import { FormikErrorMessage } from "../components/forms";
import Warning from "../components/notifications/Warning";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import ScanInput from "../components/scanInput/ScanInput";
import PermTimeSelectField from "../components/forms/PermTimeSelectField";
import RemoveButton from "../components/buttons/RemoveButton";

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().optional().label("SGP number"),
  barcode: Yup.string().required().label("Barcode"),
  selectedAddress: Yup.string().required().label("Address"),
  selectedTime: Yup.number()
    .integer()
    .positive()
    .required()
    .label("Selected Time"),
});

export default function VisiumAnalysis() {
  const [current, send] = useMachine(
    createFormMachine<
      VisiumAnalysisRequest,
      VisiumAnalysisMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.VisiumAnalysis({ request: e.values });
        },
      },
    })
  );

  const { serverError } = current.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<VisiumAnalysisRequest>
            initialValues={{
              barcode: "",
              workNumber: undefined,
              selectedAddress: "",
              selectedTime: 0,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => send({ type: "SUBMIT_FORM", values })}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="space-y-2">
                  <Heading level={2}>SGP Number</Heading>

                  <p>
                    You may optionally select an SGP number to associate with
                    this operation.
                  </p>

                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect name={"workNumber"} />
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <Heading level={2}>Labware</Heading>

                    <p>
                      Please scan in the slide you wish to select the best
                      permabilisation time for.
                    </p>

                    <div className="mt-4 md:w-1/2">
                      <ScanInput
                        onScan={(value) => setFieldValue("barcode", value)}
                        disabled={values.barcode !== ""}
                      />
                    </div>
                  </div>

                  {values.barcode !== "" && (
                    <div className="flex flex-col items-center justify-start">
                      <div className="self-end">
                        <RemoveButton
                          onClick={() => setFieldValue("barcode", "")}
                        />
                      </div>
                      <PermTimeSelectField barcode={values.barcode} />
                    </div>
                  )}

                  <FormikErrorMessage name={"barcode"} />
                </div>

                {serverError && (
                  <Warning
                    message={"Failed to save perm time"}
                    error={serverError}
                  />
                )}

                <div className="flex flex-row items-center justify-end">
                  <BlueButton type="submit">Submit</BlueButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <OperationCompleteModal
          show={current.matches("submitted")}
          message={"Visium Analysis complete"}
          onReset={reload}
        >
          <p>
            If you wish to start the process again, click the "Reset Form"
            button. Otherwise you can return to the Home screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}
