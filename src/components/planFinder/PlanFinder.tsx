import React, { useCallback, useEffect } from "react";
import { FindPlanDataQuery } from "../../types/sdk";
import { useMachine } from "@xstate/react";
import ScanInput from "../scanInput/ScanInput";
import { planFinderMachine } from "./planFinder.machine";
import Warning from "../notifications/Warning";

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
};

/**
 * A component for finding plans (from core) via scanning labware barcodes
 */
export function PlanFinder({ initialPlans, onChange }: PlanFinderParams) {
  // Plans are kept as a map of destination barcode to plan
  // by the planFinderMachine so we need to convert the initial plans list first
  const planMap = initialPlans.reduce<Map<string, FindPlanDataQuery>>(
    (memo, plan) => {
      memo.set(plan.planData.destination.barcode, plan);
      return memo;
    },
    new Map()
  );

  const [current, send] = useMachine(
    planFinderMachine.withContext({
      ...planFinderMachine.context,
      plans: planMap,
    })
  );
  const { barcode, plans, serverError, validationError } = current.context;
  const showError = serverError || validationError;

  /**
   * Whenever the plans are updated, call the onChange callback
   */
  useEffect(() => {
    onChange(Array.from(plans.values()));
  }, [plans, onChange]);

  /**
   * Callback for when the scan input value changes (i.e. the user types)
   */
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      send({ type: "UPDATE_BARCODE", barcode: e.target.value }),
    [send]
  );

  /**
   * Callback for when the user submits the barcode in the <ScanInput />
   */
  const handleOnScan = useCallback(() => send({ type: "SUBMIT_BARCODE" }), [
    send,
  ]);

  return (
    <div data-testid="plan-finder">
      {showError && (
        <Warning
          message={validationError ?? "Plan Search Error"}
          error={serverError}
        />
      )}
      <div className="mt-2 sm:w-2/3 md:w-1/2">
        <ScanInput
          value={barcode}
          onChange={handleOnChange}
          onScan={handleOnScan}
        />
      </div>
    </div>
  );
}
