import React from "react";
import AppShell from "../../components/AppShell";
import OperationCompleteModal from "../../components/modal/OperationCompleteModal";
import { reload } from "../../lib/sdk";
import {
  FindPlanDataQuery,
  GetSectioningConfirmInfoQuery,
} from "../../types/sdk";
import SectioningConfirm from "../../components/sectioningConfirm/SectioningConfirm";
import { Prompt, useLocation } from "react-router-dom";
import { useConfirmLeave } from "../../lib/hooks";

type SectioningConfirmProps = {
  readonly sectioningConfirmInfo: GetSectioningConfirmInfoQuery;
};

function Confirm({ sectioningConfirmInfo }: SectioningConfirmProps) {
  const location = useLocation<{ plans?: Array<FindPlanDataQuery> }>();
  const plans: Array<FindPlanDataQuery> = location?.state?.plans ?? [];
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Confirmation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <SectioningConfirm
            initialPlans={plans}
            comments={sectioningConfirmInfo.comments}
            onConfirmed={() => setShouldConfirm(false)}
          />
        </div>
      </AppShell.Main>

      <Prompt
        when={shouldConfirm}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />

      <OperationCompleteModal
        message={"Sections Confirmed"}
        show={!shouldConfirm}
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
