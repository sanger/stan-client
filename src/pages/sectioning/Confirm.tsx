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
import BlueButton from "../../components/buttons/BlueButton";
import { history } from "../../lib/sdk";

type SectioningConfirmProps = {
  readonly sectioningConfirmInfo: GetSectioningConfirmInfoQuery;
};

function Confirm({ sectioningConfirmInfo }: SectioningConfirmProps) {
  const location = useLocation<{ plans?: Array<FindPlanDataQuery> }>();
  const plans: Array<FindPlanDataQuery> = location?.state?.plans ?? [];
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  const confirmedPlans = React.useRef<FindPlanDataQuery[]>([]);
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
            onConfirmed={(plans) => {
              if (plans) {
                confirmedPlans.current = plans;
              }
              setShouldConfirm(false);
            }}
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
        additionalButtons={
          <BlueButton
            type="button"
            style={{ marginLeft: "auto" }}
            className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
            onClick={() => {
              history.push({
                pathname: "/store",
                state: {
                  awaitingLabwares: [...confirmedPlans.current].map(
                    (plan) => plan.planData.destination
                  ),
                },
              });
            }}
          >
            Store
          </BlueButton>
        }
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
