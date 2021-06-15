import React, { useContext, useEffect } from "react";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import { groupBy } from "lodash";
import Warning from "../../components/notifications/Warning";
import { useScrollToRef } from "../../lib/hooks";
import ConfirmByLabwareType from "./ConfirmByLabwareType";
import { SectioningPageContext } from "../Sectioning";
import OperationCompleteModal from "../../components/modal/OperationCompleteModal";
import { reload } from "../../lib/sdk";
import { LabwareTypeName } from "../../types/stan";
import DataTable from "../../components/DataTable";
import columns from "../../components/labwareScanPanel/columns";

function Confirm() {
  const model = useContext(SectioningPageContext)!;
  const [ref, scrollToRef] = useScrollToRef();

  // Scroll to the top of the page when this component is first loaded
  useEffect(() => window.scrollTo(0, 0), []);

  // When there's an error, make sure the page scrolls to it so it's in view
  useEffect(() => {
    if (model.isConfirmError) {
      scrollToRef();
    }
  }, [model, scrollToRef]);

  const { layoutPlans } = model.context;

  const layoutPlansByLabwareType = groupBy(
    layoutPlans,
    (lp) => lp.destinationLabware.labwareType.name
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Summary</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <DataTable
            data={model.context.sourceLabwares}
            columns={[columns.barcode(), columns.highestSectionForSlot("A1")]}
          />

          <div className="space-y-4">
            {/* Always show tubes first (if there are any) */}
            {layoutPlansByLabwareType?.[LabwareTypeName.TUBE] && (
              <ConfirmByLabwareType
                labwareTypeName={LabwareTypeName.TUBE}
                layoutPlans={layoutPlansByLabwareType[LabwareTypeName.TUBE]}
              />
            )}

            {/* Filter out tubes as they've been shown above */}
            {Object.entries(layoutPlansByLabwareType)
              .filter(
                ([labwareTypeName, _]) =>
                  labwareTypeName !== LabwareTypeName.TUBE
              )
              .map(([labwareTypeName, lps], i) => (
                <ConfirmByLabwareType
                  key={i}
                  layoutPlans={lps}
                  labwareTypeName={labwareTypeName}
                />
              ))}
            {model.isConfirmError && (
              <div ref={ref}>
                <Warning
                  error={model.context.serverErrors}
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
              disabled={model.isDone}
              onClick={model.backToPrep}
              action="tertiary"
            >
              Back
            </PinkButton>
            <PinkButton
              disabled={model.isDone}
              onClick={model.confirmOperation}
              action="primary"
            >
              Save
            </PinkButton>
          </div>
        </div>
      </div>

      <OperationCompleteModal
        message={"Sectioning Saved"}
        show={model.isDone}
        onReset={reload}
      >
        <p>
          If you wish to start the process again, click the "Reset Form" button.
          Otherwise you can return to the Home screen.
        </p>
      </OperationCompleteModal>
    </AppShell>
  );
}

export default Confirm;
