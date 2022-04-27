import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  LabwareFieldsFragment,
  LabwareTypeFieldsFragment,
  Maybe,
  PlanMutation,
} from "../../types/sdk";
import { uniqueId } from "lodash";
import { optionValues } from "../forms";
import BlueButton from "../buttons/BlueButton";
import { NewLabwareLayout } from "../../types/stan";
import produce from "immer";
import { unregisteredLabwareFactory } from "../../lib/factories/labwareFactory";
import LabwarePlan from "./LabwarePlan";
import LabwareScanTable from "../labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../dataTable/labwareColumns";
import LabwareScanner from "../labwareScanner/LabwareScanner";
import { buildSampleColors } from "../../lib/helpers/labwareHelper";
import Heading from "../Heading";
import { useScrollToRef } from "../../lib/hooks";
import { getNumberOfDaysBetween } from "../../lib/helpers";
import Warning from "../notifications/Warning";

type PlannerProps = {
  /**
   * The operation the user is planning for. Will be sent to core in the plan request.
   */
  operationType: "Section";

  /**
   * List of labware types that can be planned for.
   */
  allowedLabwareTypes: Array<LabwareTypeFieldsFragment>;

  /**
   * Called when an plan is added or removed from the {@link Planner}. Note that once complete, plans can not be
   * removed.
   */
  onPlanChanged: (props: PlanChangedProps) => void;
};

export type PlanChangedProps = {
  numberOfPlans: number;
  completedPlans: Array<PlanMutation>;
  sourceLabware: Array<LabwareFieldsFragment>;
};

type PlannerContextType = {
  /**
   * The name of the planning operation
   */
  operationType: string;

  /**
   * Labware that can be chosen as a source
   */
  sourceLabware: Array<LabwareFieldsFragment>;

  /**
   * Map of sampleId to colors. Used for showing consistent sample colours in different {@link LabwarePlan LabwarePlans}
   */
  sampleColors: Map<number, string>;
};

export const PlannerContext = createContext<Maybe<PlannerContextType>>(null);

type PlannerState = {
  /**
   * Labware scanned in by the user
   */
  sourceLabware: Array<LabwareFieldsFragment>;

  /**
   * Map of client ID to labware
   */
  labwarePlans: Map<string, NewLabwareLayout>;

  /**
   * Map of client ID to completed plans
   */
  completedPlans: Map<string, PlanMutation>;

  /**
   * Tracks whether the Labware Scanner should allow more labware to be scanned in
   */
  isLabwareScannerLocked: boolean;

  /**
   * Tracks whether the "Add Labware" button is currently disabled
   */
  isAddLabwareButtonDisabled: boolean;
};

const initialState: PlannerState = {
  sourceLabware: [],
  labwarePlans: new Map(),
  completedPlans: new Map(),
  isLabwareScannerLocked: false,
  isAddLabwareButtonDisabled: true,
};

type Action =
  | { type: "SET_SOURCE_LABWARE"; labware: Array<LabwareFieldsFragment> }
  | { type: "ADD_LABWARE_PLAN"; labwareType: LabwareTypeFieldsFragment }
  | { type: "REMOVE_LABWARE_PLAN"; cid: string }
  | { type: "PLAN_COMPLETE"; cid: string; plan: PlanMutation };

const FETAL_STORAGE_WEEKS = 12;

function reducer(state: PlannerState, action: Action): PlannerState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_SOURCE_LABWARE":
        draft.sourceLabware = action.labware;
        draft.isAddLabwareButtonDisabled = action.labware.length === 0;
        break;

      case "ADD_LABWARE_PLAN":
        draft.labwarePlans.set(
          uniqueId("labware_plan_"),
          unregisteredLabwareFactory.build(
            {},
            {
              associations: {
                labwareType: action.labwareType,
              },
            }
          )
        );
        // As soon as there are any plans present, stop the user from adding
        // any more source labware
        draft.isLabwareScannerLocked = true;
        break;

      case "REMOVE_LABWARE_PLAN":
        draft.labwarePlans.delete(action.cid);
        draft.isLabwareScannerLocked =
          draft.labwarePlans.size > 0 || draft.completedPlans.size > 0;
        break;

      case "PLAN_COMPLETE":
        draft.completedPlans.set(action.cid, action.plan);
        break;

      default:
        return draft;
    }
  });
}

/**
 *
 */
export default function Planner({
  allowedLabwareTypes,
  onPlanChanged,
  operationType,
}: PlannerProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Whenever any of the labware plans are added, removed, or completed,
  // call the passed in onPlanChanged callback
  useEffect(() => {
    onPlanChanged({
      completedPlans: Array.from(state.completedPlans.values()),
      sourceLabware: state.sourceLabware,
      numberOfPlans: state.labwarePlans.size,
    });
  }, [
    state.labwarePlans,
    state.completedPlans,
    state.sourceLabware,
    onPlanChanged,
  ]);

  /**
   * Used so we can get the current value of the select element when "Add Labware" is clicked
   */
  const labwareTypeSelectRef = useRef<HTMLSelectElement>(null);

  /**
   * Ref for the latest labware plan so it can be scrolled to when added to the page
   */
  const [latestLabwarePlanRef, scrollToRef] = useScrollToRef();

  /**
   * Handler for LabwareScanner's onChange event
   */
  const onLabwareScannerChange = useCallback(
    (labware: Array<LabwareFieldsFragment>) => {
      dispatch({ type: "SET_SOURCE_LABWARE", labware });
    },
    [dispatch]
  );

  /**
   * Handler for when the "Add Labware" button is clicked
   */
  const onAddLabwareClick = useCallback(() => {
    const selectedLabwareTypeName = labwareTypeSelectRef.current?.value;
    const selectedLabwareType = allowedLabwareTypes.find(
      (lt) => lt.name === selectedLabwareTypeName
    );
    if (!selectedLabwareType) {
      return;
    }
    dispatch({
      type: "ADD_LABWARE_PLAN",
      labwareType: selectedLabwareType,
    });
    scrollToRef();
  }, [labwareTypeSelectRef, allowedLabwareTypes, dispatch, scrollToRef]);

  /**
   * Handler for the onDeleteButtonClick event of a LabwarePlan
   */
  const onLabwarePlanDelete = useCallback(
    (cid: string) => {
      dispatch({ type: "REMOVE_LABWARE_PLAN", cid });
    },
    [dispatch]
  );

  /**
   * Handler for when a labware plan is completed
   */
  const onLabwarePlanComplete = useCallback(
    (cid: string, plan: PlanMutation) =>
      dispatch({ type: "PLAN_COMPLETE", cid, plan }),
    [dispatch]
  );

  /**
   * A map of sample ID to Tailwind CSS colours.
   * Used by various components to keep the same samples the same colours within different components.
   */
  const sampleColors: Map<number, string> = buildSampleColors(
    state.sourceLabware
  );

  const labwarePlans = Array.from(state.labwarePlans.entries()).map(
    ([cid, newLabwareLayout], i) => {
      return (
        <LabwarePlan
          ref={i === state.labwarePlans.size - 1 ? latestLabwarePlanRef : null}
          key={cid}
          cid={cid}
          outputLabware={newLabwareLayout}
          onDeleteButtonClick={onLabwarePlanDelete}
          onComplete={onLabwarePlanComplete}
        />
      );
    }
  );
  //Find all labwares having fetal waste samples with collection date less than 12 weeks
  const fetalSampleWarningLabware = React.useMemo(
    () =>
      state.sourceLabware.filter(
        (lw) =>
          lw.slots.find(
            (slot) =>
              slot.samples.find((sample) => {
                const numDays =
                  sample.tissue.collectionDate &&
                  getNumberOfDaysBetween(
                    sample.tissue.collectionDate,
                    new Date().toDateString()
                  );
                return numDays && numDays < FETAL_STORAGE_WEEKS * 7;
              }) !== undefined
          ) !== undefined
      ),
    [state.sourceLabware]
  );

  return (
    <div className="space-y-4">
      <Heading level={3}>Source Labware</Heading>
      <LabwareScanner
        locked={state.isLabwareScannerLocked}
        onChange={onLabwareScannerChange}
      >
        <LabwareScanTable
          columns={[
            labwareScanTableColumns.color(sampleColors),
            labwareScanTableColumns.barcode(),
            labwareScanTableColumns.donorId(),
            labwareScanTableColumns.tissueType(),
            labwareScanTableColumns.spatialLocation(),
            labwareScanTableColumns.replicate(),
          ]}
        />
      </LabwareScanner>
      {fetalSampleWarningLabware.length > 0 && (
        <Warning
          message={`The labware ${fetalSampleWarningLabware
            .map((lw) => lw.barcode)
            .join(",")} ${
            fetalSampleWarningLabware.length > 1 ? " have" : " has"
          } fetal waste samples collected less than ${FETAL_STORAGE_WEEKS} weeks. Please keep the fetal waste for ${FETAL_STORAGE_WEEKS} weeks.`}
        />
      )}

      <PlannerContext.Provider
        value={{
          operationType,
          sampleColors,
          sourceLabware: state.sourceLabware,
        }}
      >
        {labwarePlans}
      </PlannerContext.Provider>
      <div className="my-4 max-w-2xl mx-auto p-4 rounded-md bg-gray-100">
        <p className="my-3 text-gray-800 text-sm text-center leading-normal">
          Once{" "}
          <span className="font-bold text-gray-900">all source labware</span>{" "}
          has been scanned, select a type of labware to plan {operationType}{" "}
          layouts:
        </p>

        <div className="flex flex-row items-center justify-center gap-4">
          <select
            ref={labwareTypeSelectRef}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
          >
            {optionValues(allowedLabwareTypes, "name", "name")}
          </select>
          <BlueButton
            id="#addLabware"
            onClick={onAddLabwareClick}
            className="whitespace-nowrap"
            disabled={state.isAddLabwareButtonDisabled}
            action={"primary"}
          >
            + Add Labware
          </BlueButton>
        </div>
      </div>
    </div>
  );
}
