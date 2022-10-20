import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import { LabwareFieldsFragment, LabwareTypeFieldsFragment, Maybe } from '../../types/sdk';
import { uniqueId } from 'lodash';
import BlueButton from '../buttons/BlueButton';
import { NewLabwareLayout } from '../../types/stan';
import produce, { castDraft } from 'immer';
import { unregisteredLabwareFactory } from '../../lib/factories/labwareFactory';
import LabwareScanTable from '../labwareScanPanel/LabwareScanPanel';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import { buildSampleColors } from '../../lib/helpers/labwareHelper';
import Heading from '../Heading';
import { getNumberOfDaysBetween } from '../../lib/helpers';
import Warning from '../notifications/Warning';
import { Column } from 'react-table';
import labwareScanTableColumns from '../dataTableColumns/labwareColumns';
import { useScrollToRef } from '../../lib/hooks';

/**
 * The props passed to the Planner component
 * M represents the mutation object passed to the planner if 'Create Labware' is supported within each plan, otherwise null
 */
type PlannerProps<M> = {
  /**
   * The labware type to be created when "Add Labware" is clicked
   */
  selectedLabwareType: LabwareTypeFieldsFragment | undefined;

  /**
   * The number of labwares to be created when "Add Labware" is clicked
   */
  numPlansToCreate?: number;

  /***
   * Is only a single source labware allowed?
   */
  singleSourceAllowed?: boolean;
  /**
   *Callback to render the plan layouts created. This allows to customise the plan layout depending on the context it is called.
   */
  buildPlanLayouts: (
    layout: Map<string, NewLabwareLayout>, //All layouts created
    sourceLabware: LabwareFieldsFragment[],
    sampleColors: Map<number, string>,
    deleteAction: (cid: string) => void,
    confirmAction?: (cid: string, plan: M) => void,
    scrollRef?: React.MutableRefObject<HTMLDivElement | null>
  ) => JSX.Element;
  columns: Column<LabwareFieldsFragment>[];

  /**
   * Callback to render the component to display configuration setting to add a labware plan.
   */
  buildPlanCreationSettings: () => JSX.Element;

  /**
   * The operation the user is planning for , if any. Will be sent to core in the plan request.
   */
  operationType?: 'Section';

  /**
   * Called when a plan is added or removed from the {@link Planner}. Note that once complete, plans can not be
   * removed.
   */
  onPlanChanged?: (props: PlanChangedProps<M>) => void;
};

/**
 * The information send in the callback when we notify the parent about any change in plan layouts created
 */
export type PlanChangedProps<M> = {
  numberOfPlans: number;
  completedPlans: Array<M>;
  sourceLabware: Array<LabwareFieldsFragment>;
  layoutPlans: Map<string, NewLabwareLayout>;
};

/**
 * Context for planning operation
 */
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

/**
 * State which represents the current status of planning operation
 */

type PlannerState<M> = {
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
  completedPlans: Map<string, M>;

  /**
   * Tracks whether the Labware Scanner should allow more labware to be scanned in
   */
  isLabwareScannerLocked: boolean;

  /**
   * Tracks whether the "Add Labware" button is currently disabled
   */
  isAddLabwareButtonDisabled: boolean;
};

const initialState = {
  sourceLabware: [],
  labwarePlans: new Map(),
  completedPlans: new Map(),
  isLabwareScannerLocked: false,
  isAddLabwareButtonDisabled: true
};

type Action<M> =
  | { type: 'SET_SOURCE_LABWARE'; labware: Array<LabwareFieldsFragment> }
  | {
      type: 'ADD_LABWARE_PLAN';
      labwareType: LabwareTypeFieldsFragment;
      numLabwareAdd: number;
    }
  | { type: 'REMOVE_LABWARE_PLAN'; cid: string }
  | { type: 'PLAN_COMPLETE'; cid: string; plan: M };

const FETAL_STORAGE_WEEKS = 12;

function reducer<M>(state: PlannerState<M>, action: Action<M>): PlannerState<M> {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'SET_SOURCE_LABWARE':
        draft.sourceLabware = action.labware;
        draft.isAddLabwareButtonDisabled = action.labware.length === 0;
        break;

      case 'ADD_LABWARE_PLAN': {
        for (let indx = 0; indx < action.numLabwareAdd; indx++) {
          draft.labwarePlans.set(
            uniqueId('labware_plan_'),
            unregisteredLabwareFactory.build(
              {},
              {
                associations: {
                  labwareType: action.labwareType
                }
              }
            )
          );
        }
        // As soon as there are any plans present, stop the user from adding
        // any more source labware
        draft.isLabwareScannerLocked = true;
        break;
      }

      case 'REMOVE_LABWARE_PLAN':
        draft.labwarePlans.delete(action.cid);
        draft.isLabwareScannerLocked = draft.labwarePlans.size > 0 || draft.completedPlans.size > 0;
        break;

      case 'PLAN_COMPLETE':
        draft.completedPlans.set(action.cid, castDraft(action.plan));
        break;

      default:
        return draft;
    }
  });
}

/**
 *Component to display the planning operation
 */
export default function Planner<M>({
  selectedLabwareType,
  numPlansToCreate,
  onPlanChanged,
  columns,
  singleSourceAllowed,
  buildPlanLayouts,
  buildPlanCreationSettings
}: PlannerProps<M>) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Ref for the latest labware plan so it can be scrolled to when added to the page
   */
  const [scrollRef, scrollToRef] = useScrollToRef();

  /** Whenever any of the labware plans are added, removed, or completed,
   call the passed in onPlanChanged callback**/
  useEffect(() => {
    if (!onPlanChanged) {
      return;
    }
    onPlanChanged({
      completedPlans: Array.from(state.completedPlans.values()) as M[],
      sourceLabware: state.sourceLabware,
      numberOfPlans: state.labwarePlans.size,
      layoutPlans: state.labwarePlans
    });
  }, [state.labwarePlans, state.completedPlans, state.sourceLabware, onPlanChanged]);
  /**
   * Handler for LabwareScanner's onChange event
   */
  const onLabwareScannerChange = useCallback(
    (labware: Array<LabwareFieldsFragment>) => {
      dispatch({ type: 'SET_SOURCE_LABWARE', labware });
    },
    [dispatch]
  );

  /**
   * Handler for when the "Add Labware" button is clicked
   */
  const onAddLabwareClick = useCallback(() => {
    if (!selectedLabwareType) {
      return;
    }
    dispatch({
      type: 'ADD_LABWARE_PLAN',
      labwareType: selectedLabwareType,
      numLabwareAdd: numPlansToCreate ?? 1
    });
    scrollToRef();
  }, [selectedLabwareType, numPlansToCreate, dispatch, scrollToRef]);

  /**
   * Handler for the onDeleteButtonClick event of a LabwarePlan
   */
  const onLabwarePlanDelete = useCallback(
    (cid: string) => {
      dispatch({ type: 'REMOVE_LABWARE_PLAN', cid });
    },
    [dispatch]
  );

  /**
   * Handler for when a labware plan is completed
   */
  const onLabwarePlanComplete = useCallback(
    (cid: string, plan: M) => dispatch({ type: 'PLAN_COMPLETE', cid, plan }),
    [dispatch]
  );

  /**
   * A map of sample ID to Tailwind CSS colours.
   * Used by various components to keep the same samples the same colours within different components.
   */
  const sampleColors: Map<number, string> = React.useMemo(() => {
    return buildSampleColors(state.sourceLabware);
  }, [state.sourceLabware]);

  /**
   *  Find all labwares having fetal waste samples with collection date less than 12 weeks after scanning
   */
  const fetalSampleWarningLabware = React.useMemo(
    () =>
      state.sourceLabware.filter(
        (lw) =>
          lw.slots.find(
            (slot) =>
              slot.samples.find((sample) => {
                const numDays =
                  sample.tissue.collectionDate &&
                  getNumberOfDaysBetween(sample.tissue.collectionDate, new Date().toDateString());
                return numDays && numDays < FETAL_STORAGE_WEEKS * 7;
              }) !== undefined
          ) !== undefined
      ),
    [state.sourceLabware]
  );

  return (
    <div className="space-y-10">
      <Heading level={3}>Source Labware</Heading>
      <LabwareScanner
        locked={state.isLabwareScannerLocked || (singleSourceAllowed && state.sourceLabware.length === 1)}
        onChange={onLabwareScannerChange}
      >
        <LabwareScanTable columns={[labwareScanTableColumns.color(sampleColors), ...columns]} />
      </LabwareScanner>
      {fetalSampleWarningLabware.length > 0 && (
        <Warning
          message={`The labware ${fetalSampleWarningLabware.map((lw) => lw.barcode).join(',')} ${
            fetalSampleWarningLabware.length > 1 ? ' have' : ' has'
          } fetal waste samples collected less than ${FETAL_STORAGE_WEEKS} weeks ago. Please keep the fetal waste for ${FETAL_STORAGE_WEEKS} weeks.`}
        />
      )}

      {/**Render plans using the callback method (passed as props) so that it will be done by the parent component**/}
      {buildPlanLayouts(
        state.labwarePlans,
        state.sourceLabware,
        sampleColors,
        onLabwarePlanDelete,
        onLabwarePlanComplete,
        scrollRef
      )}
      <div ref={scrollRef} className="my-4 max-w-2xl mx-auto p-4 rounded-md bg-gray-100">
        <p className="my-3 text-gray-800 text-sm text-center leading-normal">
          Once <span className="font-bold text-gray-900">all source labware</span> has been scanned, select a type of
          labware to plan layouts:
        </p>
        <div className="flex flex-row items-end gap-x-4 justify-center">
          {
            /**Render plan creation settings panel using the callback method (passed as props) so that it will be done by the parent component **/
            buildPlanCreationSettings()
          }
          <div className={'flex-shrink-0 align-bottom justify-end content-end'}>
            <BlueButton
              id="#addLabware"
              onClick={onAddLabwareClick}
              className="whitespace-nowrap"
              disabled={state.isAddLabwareButtonDisabled}
              action={'primary'}
              type={'button'}
            >
              + Add Labware
            </BlueButton>
          </div>
        </div>
      </div>
    </div>
  );
}
