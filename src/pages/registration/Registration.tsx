import React, { useEffect, useRef } from "react";
import AppShell from "../../components/AppShell";
import Warning from "../../components/notifications/Warning";
import RegistrationForm from "./RegistrationForm";
import { Formik } from "formik";
import ClashModal from "./ClashModal";
import {
  GetRegistrationInfoQuery,
  LabwareFieldsFragment,
  LabwareType,
  RegisterResultFieldsFragment,
} from "../../types/sdk";
import * as Yup from "yup";
import { useMachine } from "@xstate/react";
import RegistrationSuccess from "./RegistrationSuccess";
import { useConfirmLeave } from "../../lib/hooks";
import { Prompt } from "react-router-dom";
import { Column } from "react-table";
import { createRegistrationMachine } from "../../lib/machines/registration/registrationMachine";

interface RegistrationParams<F, M, T, K> {
  title: string;
  availableLabwareTypes: LabwareType[];
  registrationInfo: GetRegistrationInfoQuery;
  initialValues: F;
  buildRegistrationInput: (
    formInput: F,
    existingTissues?: Array<string>
  ) => Promise<M>;
  registrationService: (
    mutationInput: M
  ) => Promise<RegisterResultFieldsFragment>;
  registrationValidationSchema: Yup.ObjectSchema;
  successDisplayTableColumns: Column<LabwareFieldsFragment>[];
  defaultFormTissueValues: T;
  defaultFormBlockValues: K;
}

function Registration<F, M, T, K>({
  initialValues,
  availableLabwareTypes,
  registrationInfo,
  buildRegistrationInput,
  registrationService,
  registrationValidationSchema,
  successDisplayTableColumns,
  defaultFormBlockValues,
  defaultFormTissueValues,
}: RegistrationParams<F, M, T, K>) {
  const [current, send, service] = useMachine(
    createRegistrationMachine<F, M>(buildRegistrationInput, registrationService)
  );

  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("complete")) {
        setShouldConfirm(false);
      }
    });
    return subscription.unsubscribe;
  }, [service, setShouldConfirm]);

  const warningRef = useRef<HTMLDivElement>(null);
  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const { registrationResult, registrationErrors } = current.context;
  const formIsReady = [
    "ready",
    "submitting",
    "clashed",
    "submissionError",
  ].some((val) => current.matches(val));

  if (current.matches("complete") && registrationResult) {
    return (
      <RegistrationSuccess
        labware={registrationResult.labware}
        columns={successDisplayTableColumns}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Tissue Sample Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Prompt
            when={shouldConfirm}
            message={
              "You have unsaved changes. Are you sure you want to leave?"
            }
          />

          {registrationErrors && (
            <div ref={warningRef}>
              <Warning message={"There was a problem registering your tissues"}>
                <ul className="list-disc list-inside">
                  {registrationErrors.problems.map((problem, index) => {
                    return <li key={index}>{problem}</li>;
                  })}
                </ul>
              </Warning>
            </div>
          )}

          {formIsReady && (
            <Formik<F>
              initialValues={initialValues}
              validationSchema={registrationValidationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={async (values) => send({ type: "SUBMIT_FORM", values })}
            >
              {({ values }) => (
                <>
                  <RegistrationForm
                    registrationInfo={registrationInfo}
                    availableLabwareTypes={availableLabwareTypes}
                    defaultFormBlockValues={defaultFormBlockValues}
                    defaultFormTissueValues={defaultFormTissueValues}
                  />

                  {current.matches("clashed") && registrationResult && (
                    <ClashModal
                      registrationResult={registrationResult}
                      onConfirm={() => send({ type: "SUBMIT_FORM", values })}
                      onCancel={() => send({ type: "EDIT_SUBMISSION" })}
                    />
                  )}
                </>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Registration;
