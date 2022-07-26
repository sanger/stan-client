import React from "react";
import AppShell from "../components/AppShell";
import {
  ExtractResultLabware,
  ExtractResultRequest,
  GetRecordExtractResultInfoQuery,
  LabwareFieldsFragment,
  PassFail,
  RecordExtractResultMutation,
} from "../types/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import { reload, stanCore } from "../lib/sdk";
import { Form, Formik } from "formik";
import Heading from "../components/Heading";
import WorkNumberSelect from "../components/WorkNumberSelect";
import { FormikLabwareScanner } from "../components/labwareScanner/FormikLabwareScanner";
import * as Yup from "yup";
import BlueButton from "../components/buttons/BlueButton";
import { useLocation } from "react-router-dom";
import { ExtractResultLabwareTable } from "../components/extractResultLabwareTable/ExtractResultLabwareTable";
import Warning from "../components/notifications/Warning";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";

type ExtractionResultProps = {
  info: GetRecordExtractResultInfoQuery;
};

export default function ExtractionResult({ info }: ExtractionResultProps) {
  // There will be initial labware if user has come from the Extraction page
  const location = useLocation();
  const state = location.state as { labware?: Array<LabwareFieldsFragment> };
  const initialLabware: Array<LabwareFieldsFragment> =
    state === null ? [] : state.labware ?? [];
  const initialValues: ExtractResultRequest = {
    workNumber: "",
    labware: initialLabware.map(buildExtractResultLabware),
  };

  const formMachine = React.useMemo(() => {
    return createFormMachine<
      ExtractResultRequest,
      RecordExtractResultMutation
    >().withConfig({
      services: {
        submitForm: (context, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordExtractResult({ request: e.values });
        },
      },
    });
  }, [stanCore]);

  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  const validationSchema = Yup.object().shape({
    workNumber: Yup.string().required().label("SGP Number"),
    labware: Yup.array()
      .min(1)
      .label("Labware")
      .of(
        Yup.object().shape({
          barcode: Yup.string().required(),
          result: Yup.string().oneOf([PassFail.Pass, PassFail.Fail]).required(),
          concentration: Yup.string()
            .nullable()
            .when("result", {
              is: PassFail.Pass,
              then: Yup.string().min(1).required().label("Concentration"),
            }),
          commentId: Yup.number()
            .nullable()
            .when("result", {
              is: PassFail.Fail,
              then: Yup.number()
                .required()
                .oneOf(info.comments.map((c) => c.id)),
            }),
        })
      ),
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Extraction Result</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<ExtractResultRequest>
            validationSchema={validationSchema}
            initialValues={initialValues}
            validateOnMount={true}
            onSubmit={async (values) => send({ type: "SUBMIT_FORM", values })}
          >
            {({ isValid, setFieldValue }) => (
              <Form className="space-y-8">
                <div>
                  <Heading level={3}>SGP Number</Heading>
                  <p className="mt-2">
                    Select an SGP number to associate with this extraction
                    result.
                  </p>
                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      name="workNumber"
                      onWorkNumberChange={(workNumber) =>
                        setFieldValue("workNumber", workNumber)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Heading level={3}>Labware</Heading>

                  <FormikLabwareScanner<ExtractResultLabware>
                    initialLabwares={initialLabware}
                    buildLabware={buildExtractResultLabware}
                  >
                    <ExtractResultLabwareTable
                      availableComments={info.comments}
                    />
                  </FormikLabwareScanner>
                </div>

                {serverError && (
                  <Warning message={"Save Error"} error={serverError} />
                )}

                <div className="space-y-4 flex flex-row items-center justify-end">
                  <BlueButton
                    loading={current.matches("submitting")}
                    disabled={!isValid}
                    type="submit"
                  >
                    Submit
                  </BlueButton>
                </div>

                <OperationCompleteModal
                  show={current.matches("submitted")}
                  message={"Operation Complete"}
                  onReset={reload}
                >
                  <p>
                    If you wish to start the process again, click the "Reset
                    Form" button. Otherwise you can return to the Home screen.
                  </p>
                </OperationCompleteModal>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

/**
 * Builds the default {@link ExtractResultLabware} for a labware
 * @param labware the labware to build a default for
 */
function buildExtractResultLabware(
  labware: LabwareFieldsFragment
): ExtractResultLabware {
  return {
    barcode: labware.barcode,
    result: PassFail.Pass,
    concentration: "0.00",
    commentId: undefined,
  };
}
