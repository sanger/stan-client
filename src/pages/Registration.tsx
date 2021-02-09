import React, { useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import Warning from "../components/notifications/Warning";
import RegistrationForm from "./registration/RegistrationForm";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import RegistrationPresentationModel from "../lib/presentationModels/registrationPresentationModel";

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
    return <RegistrationSuccess result={model.registrationResult} />;
  }

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

          {model.isReady() && <RegistrationForm model={model} />}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Registration;
