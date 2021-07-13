import React, { useCallback, useState } from "react";
import { GetSectioningInfoQuery } from "../../types/sdk";
import AppShell from "../../components/AppShell";
import Planner from "../../components/planning/Planner";
import { LabwareTypeName } from "../../types/stan";
import PinkButton from "../../components/buttons/PinkButton";
import ButtonBar from "../../components/ButtonBar";
import { Link } from "react-router-dom";

/**
 * Types of labware the user is allowed to section onto
 */
const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.SLIDE,
  LabwareTypeName.VISIUM_TO,
  LabwareTypeName.VISIUM_LP,
];

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Sectioning({ sectioningInfo }: SectioningParams) {
  /**
   * The next button should only be enabled when each of the plans has completed.
   */
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

  /**
   * Callback for when a user adds or removes a plan.
   */
  const handlePlanChange = useCallback(
    (numberOfPlans: number, numberOfPlansCompleted: number) => {
      setIsNextButtonEnabled(
        numberOfPlansCompleted > 0 && numberOfPlans === numberOfPlansCompleted
      );
    },
    [setIsNextButtonEnabled]
  );

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = sectioningInfo.labwareTypes.filter((lw) =>
    allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Plan</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Planner
            operationType={"Section"}
            allowedLabwareTypes={allowedLabwareTypes}
            onPlanChanged={handlePlanChange}
          />
        </div>
      </AppShell.Main>

      <ButtonBar>
        <Link to={"/sectioning/confirm"}>
          <PinkButton disabled={!isNextButtonEnabled} action="primary">
            Next {">"}
          </PinkButton>
        </Link>
      </ButtonBar>
    </AppShell>
  );
}

export default Sectioning;
