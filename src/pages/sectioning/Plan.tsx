import React, { useCallback, useState } from "react";
import {
  FindPlanDataQuery,
  GetSectioningInfoQuery,
  LabwareFieldsFragment,
  Maybe,
  PlanMutation,
} from "../../types/sdk";
import AppShell from "../../components/AppShell";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import PinkButton from "../../components/buttons/PinkButton";
import ButtonBar from "../../components/ButtonBar";
import { Link, Prompt } from "react-router-dom";
import _ from "lodash";
import { useConfirmLeave } from "../../lib/hooks";
import LabwarePlan from "../../components/planning/LabwarePlan";
import labwareScanTableColumns from "../../components/dataTable/labwareColumns";
import Planner, { PlanChangedProps } from "../../components/planning/Planner";
import { optionValues } from "../../components/forms";

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
  LabwareTypeName.FETAL_WASTE_CONTAINER,
];

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Plan({ sectioningInfo }: SectioningParams) {
  /**
   * The list of currently completed plans from the planner
   */
  const [planProps, setPlanProps] = useState<
    Maybe<PlanChangedProps<PlanMutation>>
  >(null);

  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);

  const [selectedLabwareType, setSelectedLabwareType] = React.useState<string>(
    LabwareTypeName.TUBE
  );

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = React.useMemo(
    () =>
      sectioningInfo.labwareTypes.filter((lw) =>
        allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
      ),
    [sectioningInfo.labwareTypes]
  );

  /**
   * Callback for when a user adds or removes a plan.
   */
  const handlePlanChange = useCallback(
    (props: PlanChangedProps<PlanMutation>) => {
      const allPlansComplete =
        props.completedPlans.length > 0 &&
        props.numberOfPlans === props.completedPlans.length;

      setShouldConfirm(!allPlansComplete);
      setPlanProps(props);
    },
    [setShouldConfirm, setPlanProps]
  );

  const buildPlanLayouts = React.useCallback(
    (
      plans: Map<string, NewLabwareLayout>,
      sourceLabware: LabwareFieldsFragment[],
      sampleColors: Map<number, string>,
      deleteAction: (cid: string) => void,
      confirmAction?: (cid: string, plan: PlanMutation) => void
    ) => {
      return (
        <>
          {Array.from(plans.entries()).map(([cid, newLabwareLayout]) => (
            <LabwarePlan
              key={cid}
              cid={cid}
              outputLabware={newLabwareLayout}
              sampleColors={sampleColors}
              operationType={"Section"}
              sourceLabware={sourceLabware}
              onDeleteButtonClick={deleteAction}
              onComplete={confirmAction!}
            />
          ))}
        </>
      );
    },
    []
  );
  const buildPlanCreationSettings = React.useCallback(() => {
    return (
      <select
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
        onChange={(e) => setSelectedLabwareType(e.currentTarget.value)}
      >
        {optionValues(allowedLabwareTypes, "name", "name")}
      </select>
    );
  }, [allowedLabwareTypes]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Plan</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Planner<PlanMutation>
            operationType={"Section"}
            selectedLabwareType={allowedLabwareTypes.find(
              (lt) => lt.name === selectedLabwareType
            )}
            onPlanChanged={handlePlanChange}
            buildPlanCreationSettings={buildPlanCreationSettings}
            buildPlanLayouts={buildPlanLayouts}
            columns={[
              labwareScanTableColumns.barcode(),
              labwareScanTableColumns.donorId(),
              labwareScanTableColumns.tissueType(),
              labwareScanTableColumns.spatialLocation(),
              labwareScanTableColumns.replicate(),
            ]}
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
  planProps: Maybe<PlanChangedProps<PlanMutation>>
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
