import React, { useEffect } from "react";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import { sortBy } from "lodash";
import { LabwareTypeName } from "../../types/stan";
import Warning from "../../components/notifications/Warning";
import { useScrollToRef } from "../../lib/hooks";
import ConfirmByLabwareType from "./ConfirmByLabwareType";
import { toast } from "react-toastify";
import Success from "../../components/notifications/Success";
import SectioningPresentationModel from "../../lib/presentationModels/sectioningPresentationModel";

interface ConfirmProps {
  model: SectioningPresentationModel;
}

const Confirm: React.FC<ConfirmProps> = ({ model }) => {
  const [ref, scrollToRef] = useScrollToRef();

  // Scroll to the top of the page when this component is first loaded
  useEffect(() => window.scrollTo(0, 0), []);

  // When there's an error, make sure the page scrolls to it so it's in view
  useEffect(() => {
    if (model.isConfirmError()) {
      scrollToRef();
    }
  }, [model, scrollToRef]);

  // Show a toast notification with a success message when sectioning is complete
  useEffect(() => {
    if (model.isDone()) {
      toast(<Success message={"Sectioning Saved"} />, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [model]);

  const { sectioningConfirmMachines } = model.current.context;

  // Sort the sectioning confirmations by having tubes first
  const sortedConfirmMachines = sortBy(
    Array.from(sectioningConfirmMachines.keys()),
    (labwareTypeName) => labwareTypeName !== LabwareTypeName.TUBE
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Summary</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <div className="space-y-4">
            {sortedConfirmMachines.map((labwareTypeName, i) => (
              <ConfirmByLabwareType
                key={i}
                actors={sectioningConfirmMachines.get(labwareTypeName)}
                labwareTypeName={labwareTypeName}
              />
            ))}
            {model.isConfirmError() && (
              <div ref={ref}>
                <Warning
                  message={
                    "There was an error confirming the Sectioning operation"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-row items-center justify-between">
            <PinkButton
              disabled={model.isDone()}
              onClick={model.backToPrep}
              action="tertiary"
            >
              Back
            </PinkButton>
            <PinkButton
              disabled={model.isDone()}
              onClick={model.confirmOperation}
              action="primary"
            >
              Save
            </PinkButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Confirm;
