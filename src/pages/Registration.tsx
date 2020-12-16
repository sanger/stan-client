import React, { useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import PinkButton from "../components/buttons/PinkButton";
import registrationMachine from "../lib/machines/registration/registrationMachine";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import Warning from "../components/notifications/Warning";
import RegistrationForm from "./registration/RegistrationForm";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import { useMachine } from "@xstate/react";

function Registration(): JSX.Element {
  const [current, send] = useMachine(registrationMachine);
  const warningRef = useRef<HTMLDivElement>(null);

  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Tissue Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {current.matches("loading") && (
            <LoadingSpinner className="mx-auto mt-10 h-8 w-8" />
          )}

          {current.matches("error") && (
            <div className="mx-auto max-w-screen-lg">
              <Warning message={current.context.loadingError}>
                <PinkButton className="mt-4" onClick={() => send("RETRY")}>
                  Retry
                </PinkButton>
              </Warning>
            </div>
          )}

          {current.matches("submissionError") && (
            <div ref={warningRef}>
              <Warning message={"There was a problem registering your tissues"}>
                <ul className="list-disc list-inside">
                  {current.context.registrationErrors.problems.map(
                    (problem, index) => {
                      return <li key={index}>{problem}</li>;
                    }
                  )}
                </ul>
              </Warning>
            </div>
          )}

          {["loaded", "submitting", "submissionError"].some((val) =>
            current.matches(val)
          ) && (
            <RegistrationForm
              submitting={current.matches("submitting")}
              registrationInfo={current.context.registrationInfo}
              registrationSchema={current.context.registrationSchema}
              onSubmission={(values) => send({ type: "SUBMIT_FORM", values })}
            />
          )}

          {current.matches("complete") && (
            <RegistrationSuccess result={current.context.registrationResult} />
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Registration;
