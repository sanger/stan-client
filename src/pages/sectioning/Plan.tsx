import React, { useCallback, useState } from "react";
import {
  FindPlanDataQuery,
  GetSectioningInfoQuery,
  Maybe,
} from "../../types/sdk";
import AppShell from "../../components/AppShell";
import Planner, { PlanChangedProps } from "../../components/planning/Planner";
import { LabwareTypeName } from "../../types/stan";
import PinkButton from "../../components/buttons/PinkButton";
import ButtonBar from "../../components/ButtonBar";
import { Link, Prompt } from "react-router-dom";
import _ from "lodash";
import { useConfirmLeave } from "../../lib/hooks";

/**
 * Types of labware the user is allowed to section onto
 */
const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.SLIDE,
  LabwareTypeName.VISIUM_TO,
  LabwareTypeName.VISIUM_LP,
  LabwareTypeName.VISIUM_ADH,
  LabwareTypeName.FOUR_SLOT_SLIDE,
  LabwareTypeName.FETAL_WASTE,
];

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Plan({ sectioningInfo }: SectioningParams) {
  /**
   * The list of currently completed plans from the planner
   */
  const [planProps, setPlanProps] = useState<Maybe<PlanChangedProps>>(null);

  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);

  /**
   * Callback for when a user adds or removes a plan.
   */
  const handlePlanChange = useCallback(
    (props: PlanChangedProps) => {
      const allPlansComplete =
        props.completedPlans.length > 0 &&
        props.numberOfPlans === props.completedPlans.length;

      setShouldConfirm(!allPlansComplete);
      setPlanProps(props);
    },
    [setShouldConfirm, setPlanProps]
  );

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = sectioningInfo.labwareTypes.filter((lw) =>
    allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
  );

  debugger;
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
        <Link
          to={{
            pathname: "/lab/sectioning/confirm",
            state: { plans: planPropsToPlanData(planProps) },
          }}
        >
          <PinkButton disabled={shouldConfirm} action="primary">
            Next {">"}
          </PinkButton>
        </Link>
      </ButtonBar>

      <Prompt
        when={shouldConfirm}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />
    </AppShell>
  );
}

export default Plan;

/**
 * Useful for passing as initial state to Sectioning Confirm.
 */
function planPropsToPlanData(
  planProps: Maybe<PlanChangedProps>
): Array<FindPlanDataQuery> {
  if (planProps == null) {
    return [];
  }

  const sources = planProps.sourceLabware;

  const destinationLabware = _(planProps.completedPlans)
    .flatMap((cp) => cp.plan.labware)
    .keyBy((lw) => lw.id)
    .value();

  const planActions = _(planProps.completedPlans)
    .map((cp) => cp.plan)
    .flatMap((plan) => plan.operations)
    .flatMap((operation) => operation.planActions)
    .groupBy((pa) => pa.destination.labwareId)
    .value();

  return Object.keys(planActions).map((labwareId) => {
    return {
      planData: {
        sources,
        destination: destinationLabware[labwareId],
        plan: {
          operationType: {
            name: "Section",
          },
          planActions: planActions[labwareId],
        },
      },
    };
  });
}
