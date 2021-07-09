import React, { createContext, useCallback, useReducer, useRef } from "react";
import {
  LabwareFieldsFragment,
  LabwareTypeFieldsFragment,
  Maybe,
  PlanResult,
} from "../../types/sdk";
import { find, uniqueId } from "lodash";
import { optionValues } from "../forms";
import BlueButton from "../buttons/BlueButton";
import { NewLabwareLayout } from "../../types/stan";
import produce from "immer";
import { unregisteredLabwareFactory } from "../../lib/factories/labwareFactory";
import LabwarePlan from "./LabwarePlan";

type PlannerProps = {
  /**
   * The operation the user is planning for. Will be sent to core in the plan request.
   */
  operationType: string;

  /**
   * List of labware types that can be planned for.
   */
  allowedLabwareTypes: Array<LabwareTypeFieldsFragment>;

  /**
   * All sources that can have samples
   */
  sourceLabware: Array<LabwareFieldsFragment>;

  /**
   * Section thickness is an optional field for planning. Setting this parameter to false hides the section thickness
   * form input.
   */
  showSectionThickness: boolean;

  /**
   * Map of sample ID to tailwind CSS colors.
   */
  sampleColors: Map<number, string>;

  /**
   * Called when a new plan is added in the {@link Planner}
   */
  onPlanAdded: (numberOfPlans: number, numberOfCompletedPlans: number) => void;

  /**
   * Called when an incomplete plan is removed from the {@link Planner}. Note that once complete, plans can not be
   * removed.
   * @param numberOfPlans the total number of plans in the planner
   * @param numberOfCompletedPlans the number of completed plans
   */
  onPlanDeleted: (
    numberOfPlans: number,
    numberOfCompletedPlans: number
  ) => void;

  /**
   * Called when a plan is completed
   * @param numberOfPlans the total number of plans in the planner
   * @param numberOfCompletedPlans the number of completed plans
   */
  onPlanCompleted: (
    completedPlan: PlanResult,
    allPlans: Array<PlanResult>,
    numberOfPlans: number,
    numberOfCompletedPlans: number
  ) => void;
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
   * Section thickness is an optional field for planning. Setting this parameter to false hides the section thickness
   * form input.
   */
  showSectionThickness: boolean;

  /**
   * Map of sampleId to colors. Used for showing consistent sample colours in different {@link LabwarePlan LabwarePlans}
   */
  sampleColors: Map<number, string>;
};

export const PlannerContext = createContext<Maybe<PlannerContextType>>(null);

type PlannerState = {
  /**
   * Map of client ID to labware
   */
  labwarePlans: Map<string, NewLabwareLayout>;
};

type Action =
  | { type: "ADD_LABWARE_PLAN"; labwareType: LabwareTypeFieldsFragment }
  | { type: "REMOVE_LABWARE_PLAN"; cid: string };

const initialState: PlannerState = {
  labwarePlans: new Map(),
};

function reducer(state: PlannerState, action: Action): PlannerState {
  return produce(state, (draft) => {
    switch (action.type) {
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
        break;

      case "REMOVE_LABWARE_PLAN":
        draft.labwarePlans.delete(action.cid);
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
  onPlanAdded,
  onPlanCompleted,
  onPlanDeleted,
  operationType,
  sampleColors,
  showSectionThickness,
  sourceLabware,
}: PlannerProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Used so we can get the current value of the select element when "Add Labware" is clicked
   */
  const labwareTypeSelectRef = useRef<HTMLSelectElement>(null);

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
  }, [labwareTypeSelectRef, allowedLabwareTypes, dispatch]);

  /**
   * Handler for the onDeleteButtonClick event of a LabwarePlan
   */
  const onLabwarePlanDelete = useCallback(
    (cid: string) => {
      dispatch({ type: "REMOVE_LABWARE_PLAN", cid });
    },
    [dispatch]
  );

  const labwarePlans = Array.from(state.labwarePlans.entries()).map(
    ([cid, newLabwareLayout]) => {
      return (
        <LabwarePlan
          key={cid}
          cid={cid}
          outputLabware={newLabwareLayout}
          onDeleteButtonClick={onLabwarePlanDelete}
          onComplete={() => {}}
        />
      );
    }
  );

  return (
    <div className="space-y-4">
      <PlannerContext.Provider
        value={{
          operationType,
          sampleColors,
          showSectionThickness,
          sourceLabware,
        }}
      >
        {labwarePlans}
      </PlannerContext.Provider>
      <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
        <p className="my-3 text-gray-800 text-sm leading-normal">
          Once <span className="font-bold text-gray-900">all blocks</span> have
          been scanned, select a type of labware to plan Sectioning layouts:
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
            // disabled={!model.isAddLabwareBtnEnabled}
            onClick={onAddLabwareClick}
            className="whitespace-nowrap"
            action={"primary"}
          >
            + Add Labware
          </BlueButton>
        </div>
      </div>
    </div>
  );
}
