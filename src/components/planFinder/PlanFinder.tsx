import React, { useCallback, useEffect } from 'react';
import { FindPlanDataQuery, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { useMachine } from '@xstate/react';
import { planFinderMachine } from './planFinder.machine';
import Warning from '../notifications/Warning';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import { usePrevious } from '../../lib/hooks';
import { isEqual } from 'lodash';

type PlanFinderParams = {
  /**
   * The plans to initialise the component with
   */
  initialPlans: Array<FindPlanDataQuery>;

  /**
   * Callback for when a plan is added or removed
   * @param plans the current list of plans
   */
  onChange: (plans: Array<FindPlanDataQuery>) => void;

  /**
   * React function child
   */
  children: (props: PlanFinderChildrenProps) => React.ReactNode;
};

/**
 * Props passed to the children of PlanFinder
 */
type PlanFinderChildrenProps = {
  /**
   * The current list of plans
   */
  plans: Array<FindPlanDataQuery>;

  /**
   * A function that will remove a plan for a labware barcode
   * @param barcode a labware barcode
   */
  removePlanByBarcode: (barcode: string) => void;
};

/**
 * A component for finding plans (from core) via scanning labware barcodes
 */
export function PlanFinder({ initialPlans, onChange, children }: PlanFinderParams) {
  const memoPlanFinderMachine = React.useMemo(() => {
    // Plans are kept as a map of destination barcode to plan
    // by the planFinderMachine so we need to convert the initial plans list first
    const planMap = initialPlans.reduce<Map<string, FindPlanDataQuery>>((memo, plan) => {
      memo.set(plan.planData.destination.barcode, plan);
      return memo;
    }, new Map());
    return planFinderMachine(planMap);
  }, [initialPlans]);

  const [current, send] = useMachine(memoPlanFinderMachine);
  const { plans, requestError, validationError } = current.context;
  const showError = requestError || validationError;
  /**
   * Whenever the plans are updated, call the onChange callback
   */
  const plansArray = Array.from(plans.values());
  const previousPlans = usePrevious(plansArray);
  useEffect(() => {
    if (!isEqual(previousPlans, plansArray)) {
      onChange(plansArray);
    }
  }, [plansArray, onChange, previousPlans]);

  /**
   * Callback for when the user submits the barcode in the <ScanInput />
   */
  const handleOnScan = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      send({ type: 'SUBMIT_LABWARE', labware });
    },
    [send]
  );

  /**
   * Callback for removing a plan by barcode
   */
  const removePlanByBarcode = useCallback(
    (barcode: string) => {
      send({ type: 'REMOVE_PLAN_BY_BARCODE', barcode });
    },
    [send]
  );
  const memoizedChildren = React.useMemo(
    () => children({ plans: Array.from(plans.values()), removePlanByBarcode }),
    [plans, removePlanByBarcode, children]
  );

  return (
    <div className={'max-w-screen-xl mx-auto'}>
      {showError && <Warning message={validationError ?? 'Plan Search Error'} error={requestError} />}
      <div data-testid="plan-finder">
        <LabwareScanner onAdd={handleOnScan} enableFlaggedLabwareCheck />
      </div>
      {memoizedChildren}
    </div>
  );
}
