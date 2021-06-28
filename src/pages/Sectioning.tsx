import React, { useCallback, useMemo, useEffect } from "react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import {
  ConfirmOperationLabware,
  GetSectioningInfoQuery,
  LabwareFieldsFragment,
  LabwareTypeFieldsFragment,
  Maybe,
} from "../types/sdk";
import {
  createSectioningMachine,
  SectioningContext,
} from "../lib/machines/sectioning/sectioningMachine";
import { useMachine } from "@xstate/react";
import { Prompt } from "react-router-dom";
import { useConfirmLeave } from "../lib/hooks";
import { SectioningLayout } from "../lib/machines/sectioning/sectioningLayout/sectioningLayoutMachine";

type SectioningPageContextType = {
  isLabwareTableLocked: boolean;
  isAddLabwareBtnEnabled: boolean;
  isNextBtnEnabled: boolean;
  isConfirming: boolean;
  isStarted: boolean;
  isConfirmError: boolean;
  isDone: boolean;
  updateLabwares: (labwares: Array<LabwareFieldsFragment>) => void;
  deleteLabwareLayout: (index: number) => void;
  selectLabwareType: (labwareType: LabwareTypeFieldsFragment) => void;
  addLabwareLayout: () => void;
  prepDone: () => void;
  confirmOperation: () => void;
  context: SectioningContext;
  addPlan(sectioningLayout: SectioningLayout): void;
  commitConfirmation(confirmOperationLabware: ConfirmOperationLabware): void;
};

export const SectioningPageContext = React.createContext<
  Maybe<SectioningPageContextType>
>(null);

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Sectioning({ sectioningInfo }: SectioningParams) {
  const [current, send, service] = useMachine(
    createSectioningMachine(sectioningInfo)
  );

  const addPlan = useCallback(
    (sectioningLayout: SectioningLayout) => {
      send({ type: "PLAN_ADDED", sectioningLayout });
    },
    [send]
  );

  const commitConfirmation = useCallback(
    (confirmOperationLabware: ConfirmOperationLabware) => {
      send({ type: "COMMIT_CONFIRMATION", confirmOperationLabware });
    },
    [send]
  );

  const sectioningPageContext: SectioningPageContextType = useMemo(() => {
    return {
      addLabwareLayout(): void {
        send({ type: "ADD_LABWARE_LAYOUT" });
      },
      confirmOperation(): void {
        send({ type: "CONFIRM_SECTION" });
      },
      deleteLabwareLayout(index: number): void {
        send({
          type: "DELETE_LABWARE_LAYOUT",
          index,
        });
      },
      isAddLabwareBtnEnabled: current.matches("started"),
      isConfirmError: current.matches({ confirming: "confirmError" }),
      isConfirming: current.matches("confirming") || current.matches("done"),
      isDone: current.matches("done"),
      isLabwareTableLocked: current.context.sectioningLayouts.length > 0,
      isNextBtnEnabled:
        current.context.sectioningLayouts.length > 0 &&
        current.context.sectioningLayouts.every((sl) => sl.plan != null),
      isStarted: current.matches("started"),
      prepDone(): void {
        send({ type: "PREP_DONE" });
      },
      selectLabwareType(labwareType: LabwareTypeFieldsFragment): void {
        send({
          type: "SELECT_LABWARE_TYPE",
          labwareType,
        });
      },
      updateLabwares(labwares: Array<LabwareFieldsFragment>): void {
        send({ type: "UPDATE_LABWARES", labwares });
      },
      addPlan,
      commitConfirmation,
      context: current.context,
    };
  }, [current, send, commitConfirmation, addPlan]);

  const [inProgress, setInProgress] = useConfirmLeave();
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("started")) {
        setInProgress(true);
      }

      if (state.matches("done")) {
        setInProgress(false);
      }
    });

    return subscription.unsubscribe;
  }, [service, setInProgress]);

  const showConfirm = current.matches("confirming") || current.matches("done");

  return (
    <SectioningPageContext.Provider value={sectioningPageContext}>
      <Prompt
        when={inProgress}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />
      {showConfirm ? <Confirm /> : <Plan />}
    </SectioningPageContext.Provider>
  );
}

export default Sectioning;
