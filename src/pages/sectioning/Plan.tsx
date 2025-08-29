import React, { useCallback, useState } from 'react';
import {
  FindPlanDataQuery,
  GetSectioningInfoQuery,
  LabwareFlaggedFieldsFragment,
  Maybe,
  PlanMutation
} from '../../types/sdk';
import AppShell from '../../components/AppShell';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../types/stan';
import PinkButton from '../../components/buttons/PinkButton';
import ButtonBar from '../../components/ButtonBar';
import { Link, useLoaderData } from 'react-router-dom';
import _ from 'lodash';
import { useConfirmLeave } from '../../lib/hooks';
import LabwarePlan from '../../components/planning/LabwarePlan';
import labwareScanTableColumns from '../../components/dataTableColumns/labwareColumns';
import Planner, { PlanChangedProps } from '../../components/planning/Planner';
import { selectOptionValues } from '../../components/forms';
import CustomReactSelect, { OptionType } from '../../components/forms/CustomReactSelect';
import PromptOnLeave from '../../components/notifications/PromptOnLeave';
import { convertLabwareToFlaggedLabware } from '../../lib/helpers/labwareHelper';

/**
 * Types of labware the user is allowed to section onto
 */
const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.SUPER_FROST_PLUS_SLIDE,
  LabwareTypeName.VISIUM_TO,
  LabwareTypeName.VISIUM_LP,
  LabwareTypeName.VISIUM_ADH,
  LabwareTypeName.FETAL_WASTE_CONTAINER,
  LabwareTypeName.XENIUM
];

function Plan() {
  /**
   * The list of currently completed plans from the planner
   */
  const [planProps, setPlanProps] = useState<Maybe<PlanChangedProps<PlanMutation>>>(null);

  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);

  const [selectedLabwareType, setSelectedLabwareType] = React.useState<string>(LabwareTypeName.TUBE);

  const [numLabware, setNumLabware] = React.useState<number>(1);

  const [sectionThickness, setSectionThickness] = React.useState<number>(0.5);

  const sectioningInfo = useLoaderData() as GetSectioningInfoQuery;
  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = React.useMemo(
    () => sectioningInfo.labwareTypes.filter((lw) => allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)),
    [sectioningInfo.labwareTypes]
  );

  /**
   * Callback for when a user adds or removes a plan.
   */
  const handlePlanChange = useCallback(
    (props: PlanChangedProps<PlanMutation>) => {
      const allPlansComplete = props.completedPlans.length > 0 && props.numberOfPlans === props.completedPlans.length;
      setShouldConfirm(!allPlansComplete);
      setPlanProps(props);
    },
    [setShouldConfirm, setPlanProps]
  );

  const buildPlanLayouts = (
    plans: Map<string, { labware: NewFlaggedLabwareLayout; sectionThickness?: number }>,
    sourceLabware: LabwareFlaggedFieldsFragment[],
    sampleColors: Map<number, string>,
    deleteAction: (cid: string) => void,
    confirmAction?: (cid: string, plan: PlanMutation) => void
  ) => {
    return (
      <>
        {Array.from(plans.entries()).map(([cid, newLabwareParams]) => (
          <LabwarePlan
            key={cid}
            cid={cid}
            outputLabware={newLabwareParams.labware}
            sampleColors={sampleColors}
            operationType={'Section'}
            sourceLabware={sourceLabware}
            onDeleteButtonClick={deleteAction}
            onComplete={confirmAction!}
            sectionThickness={newLabwareParams.sectionThickness ?? 0.5}
          />
        ))}
      </>
    );
  };

  const buildPlanCreationSettings = React.useCallback(() => {
    return (
      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-1 text-center">
        <div className="text-gray-500">Labware type</div>
        <div className="text-gray-500">Number of labware</div>
        <div className="text-gray-500">Section Thickness</div>
        <CustomReactSelect
          dataTestId={'labware-type'}
          handleChange={(val) => setSelectedLabwareType((val as OptionType).label)}
          value={selectedLabwareType}
          options={selectOptionValues(allowedLabwareTypes, 'name', 'name')}
        />
        <input
          type="number"
          className="block h-10 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setNumLabware(Number(e.currentTarget.value))}
          value={numLabware}
          data-testid={'numLabware'}
          min={1}
        />
        <input
          type="number"
          className="block h-10 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setSectionThickness(Number(e.currentTarget.value))}
          value={sectionThickness}
          data-testid={'sectionThickness'}
          min={0.5}
          step={0.5}
        />
      </div>
    );
  }, [allowedLabwareTypes, setSelectedLabwareType, selectedLabwareType, setNumLabware, numLabware, sectionThickness]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Plan</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Planner<PlanMutation>
            operationType={'Section'}
            numPlansToCreate={numLabware}
            sectionThickness={sectionThickness}
            selectedLabwareType={allowedLabwareTypes.find((lt) => lt.name === selectedLabwareType)}
            onPlanChanged={handlePlanChange}
            buildPlanCreationSettings={buildPlanCreationSettings}
            buildPlanLayouts={buildPlanLayouts}
            columns={[
              labwareScanTableColumns.barcode(),
              labwareScanTableColumns.donorId(),
              labwareScanTableColumns.tissueType(),
              labwareScanTableColumns.spatialLocation(),
              labwareScanTableColumns.replicate()
            ]}
          />
        </div>
      </AppShell.Main>

      <ButtonBar>
        <Link to="/lab/sectioning/confirm" state={{ plans: planPropsToPlanData(planProps) }}>
          <PinkButton disabled={shouldConfirm} action="primary">
            Next {'>'}
          </PinkButton>
        </Link>
      </ButtonBar>

      <PromptOnLeave when={shouldConfirm} message={'You have unsaved changes. Are you sure you want to leave?'} />
    </AppShell>
  );
}

export default Plan;

/**
 * Useful for passing as initial state to Sectioning Confirm.
 */
function planPropsToPlanData(planProps: Maybe<PlanChangedProps<PlanMutation>>): Array<FindPlanDataQuery> {
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
        sources: sources,
        destination: convertLabwareToFlaggedLabware([destinationLabware[labwareId]])[0],
        plan: {
          operationType: {
            name: 'Section'
          },
          planActions: planActions[labwareId]
        }
      }
    };
  });
}
