import React, { useEffect, useMemo, useRef } from "react";
import AppShell from "../components/AppShell";
import Warning from "../components/notifications/Warning";
import RegistrationForm from "./registration/RegistrationForm";
import { Formik } from "formik";
import ClashModal from "./registration/ClashModal";
import { GetRegistrationInfoQuery, LifeStage } from "../types/sdk";
import * as Yup from "yup";
import RegistrationValidation from "../lib/validation/registrationValidation";
import { useMachine } from "@xstate/react";
import registrationMachine from "../lib/machines/registration/registrationMachine";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import columns from "../components/dataTable/labwareColumns";
import { useConfirmLeave } from "../lib/hooks";
import { Prompt } from "react-router-dom";

export interface RegistrationFormBlock {
  clientId: number;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: string;
  lastKnownSectionNumber: number;
  labwareType: string;
  fixative: string;
  medium: string;
  mouldSize: string;
}

export interface RegistrationFormTissue {
  clientId: number;
  donorId: string;
  lifeStage: LifeStage;
  species: string;
  hmdmc: string;
  tissueType: string;
  blocks: RegistrationFormBlock[];
}

export interface RegistrationFormValues {
  tissues: Array<RegistrationFormTissue>;
}

export function getRegistrationFormBlock(): RegistrationFormBlock {
  return {
    clientId: Date.now(),
    externalIdentifier: "",
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    replicateNumber: "",
    lastKnownSectionNumber: 0,
    labwareType: "",
    fixative: "",
    medium: "",
    mouldSize: "",
  };
}

export function getRegistrationFormTissue(): RegistrationFormTissue {
  return {
    clientId: Date.now(),
    donorId: "",
    species: "",
    lifeStage: LifeStage.Fetal,
    hmdmc: "",
    tissueType: "",
    blocks: [getRegistrationFormBlock()],
  };
}

const initialValues: RegistrationFormValues = {
  tissues: [getRegistrationFormTissue()],
};

function buildRegistrationSchema(
  registrationInfo: GetRegistrationInfoQuery
): Yup.ObjectSchema {
  const validation = new RegistrationValidation(registrationInfo);
  return Yup.object().shape({
    tissues: Yup.array()
      .min(1)
      .of(
        Yup.object().shape({
          donorId: validation.donorId,
          lifeStage: validation.lifeStage,
          species: validation.species,
          hmdmc: validation.hmdmc,
          tissueType: validation.tissueType,
          blocks: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                externalIdentifier: validation.externalIdentifier,
                spatialLocation: validation.spatialLocation,
                replicateNumber: validation.replicateNumber,
                lastKnownSectionNumber: validation.lastKnownSectionNumber,
                labwareType: validation.labwareType,
                fixative: validation.fixative,
                medium: validation.medium,
                mouldSize: validation.mouldSize,
              })
            ),
        })
      ),
  });
}

interface RegistrationParams {
  registrationInfo: GetRegistrationInfoQuery;
}

function Registration({ registrationInfo }: RegistrationParams) {
  const [current, send, service] = useMachine(registrationMachine);

  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("complete")) {
        setShouldConfirm(false);
      }
    });
    return subscription.unsubscribe;
  }, [service, setShouldConfirm]);

  const validationSchema = useMemo(() => {
    return buildRegistrationSchema(registrationInfo);
  }, [registrationInfo]);

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
        labware={registrationResult.register.labware}
        columns={[
          columns.barcode(),
          columns.labwareType(),
          columns.externalName(),
        ]}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Block Registration</AppShell.Title>
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
            <Formik<RegistrationFormValues>
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={async (values) => send({ type: "SUBMIT_FORM", values })}
            >
              {({ values }) => (
                <>
                  <RegistrationForm registrationInfo={registrationInfo} />

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
