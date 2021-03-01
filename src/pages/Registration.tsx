import React, { useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import Warning from "../components/notifications/Warning";
import RegistrationForm from "./registration/RegistrationForm";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import RegistrationPresentationModel from "../lib/presentationModels/registrationPresentationModel";
import { Formik } from "formik";
import {
  FormValues,
  getInitialTissueValues,
} from "../lib/services/registrationService";
import columns from "../components/labwareScanPanel/columns";

interface RegistrationParams {
  model: RegistrationPresentationModel;
}

const Registration: React.FC<RegistrationParams> = ({ model }) => {
  const warningRef = useRef<HTMLDivElement>(null);

  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  if (model.isComplete()) {
    return (
      <RegistrationSuccess
        labware={model.registrationResult.register.labware}
        columns={[
          columns.barcode(),
          columns.labwareType(),
          columns.externalName(),
        ]}
      />
    );
  }

  // Initial values provided to Formik
  const initialValues: FormValues = { tissues: [getInitialTissueValues()] };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Tissue Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {model.isSubmissionError() && (
            <div ref={warningRef}>
              <Warning message={"There was a problem registering your tissues"}>
                <ul className="list-disc list-inside">
                  {model.registrationErrors.problems.map((problem, index) => {
                    return <li key={index}>{problem}</li>;
                  })}
                </ul>
              </Warning>
            </div>
          )}

          {model.isReady() && (
            <Formik<FormValues>
              initialValues={initialValues}
              validationSchema={model.registrationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={(values) => {
                model.submitForm(values);
              }}
            >
              <RegistrationForm model={model} />
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Registration;
