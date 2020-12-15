import React from "react";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import { State } from "xstate";
import {
  SectioningContext,
  SectioningEvents,
} from "../../lib/machines/sectioning";
import { backToPrep } from "../../lib/machines/sectioning/sectioningEvents";
import SectioningConfirm from "../../components/SectioningConfirm";

interface OutcomesProps {
  current: State<
    SectioningContext,
    SectioningEvents,
    any,
    { value: any; context: SectioningContext }
  >;
  send: any;
}

const Outcomes: React.FC<OutcomesProps> = ({ current, send }) => {
  const { confirmOperationLabware } = current.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Summary</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <div className="space-y-4">
            {confirmOperationLabware.map((cop) => (
              <SectioningConfirm actor={cop.ref} />
            ))}
          </div>
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-row items-center justify-between">
            <PinkButton onClick={() => send(backToPrep())} action="tertiary">
              Back
            </PinkButton>
            <PinkButton action="primary">Save</PinkButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Outcomes;
