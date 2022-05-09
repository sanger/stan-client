import React, { useEffect, useRef } from "react";
import AppShell from "../../components/AppShell";
import Warning from "../../components/notifications/Warning";
import RegistrationForm, { TextType } from "./RegistrationForm";
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

/**
 * Expect form input interface
 */
interface FormInput<T> {
  tissues: T[];
}

/**
 * Expected Tissue value interfcae
 */
export interface TissueValues<B> {
  blocks: B[];
}

interface RegistrationParams<M, T, B> {
  /**
   * Title to be displayed in the page
   * **/
  title: string;
  /**
   * Labware types available for registration
   */
  availableLabwareTypes: LabwareType[];
  /**
   * Registration information like available species,fixatives etc
   */
  registrationInfo: GetRegistrationInfoQuery;

  /**
   * Default values for Tissue
   */
  defaultFormTissueValues: T;

  /**
   * Handler to convert form input data to the format that mutation api expects
   * @param formInput
   * @param existingTissues
   */
  buildRegistrationInput: (
    formInput: FormInput<T>,
    existingTissues?: Array<string>
  ) => Promise<M>;
  /**
   * Service to call for registration
   * @param mutationInput
   */
  registrationService: (
    mutationInput: M
  ) => Promise<RegisterResultFieldsFragment>;
  /**
   * Validation schema for form input
   */
  registrationValidationSchema: Yup.ObjectSchema;
  /**
   * Columns to display on succesful registration
   */
  successDisplayTableColumns: Column<LabwareFieldsFragment>[];

  /**
   * Change in default keywords to display
   */
  keywordsMap?: Map<TextType, string>;
}

function Registration<M, T extends TissueValues<B>, B>({
  title,
  availableLabwareTypes,
  registrationInfo,
  buildRegistrationInput,
  registrationService,
  registrationValidationSchema,
  successDisplayTableColumns,
  defaultFormTissueValues,
  keywordsMap,
}: RegistrationParams<M, T, B>) {
  const [current, send, service] = useMachine(
    createRegistrationMachine<FormInput<T>, M>(
      buildRegistrationInput,
      registrationService
    )
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

  const initialValues = {
    tissues: [defaultFormTissueValues],
  };
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
        <AppShell.Title>{title}</AppShell.Title>
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
            <Formik<FormInput<T>>
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
                    defaultFormTissueValues={defaultFormTissueValues}
                    keywordsMap={keywordsMap}
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
