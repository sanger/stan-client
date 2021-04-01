import React, { useMemo } from "react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import {
  GetSectioningInfoQuery,
  LabwareFieldsFragment,
  LabwareTypeFieldsFragment,
  Maybe,
} from "../types/graphql";
import { LabwareTypeName } from "../types/stan";
import { sectioningMachine } from "../lib/machines/sectioning/sectioningMachine";
import { useMachine } from "@xstate/react";
import { SectioningContext } from "../lib/machines/sectioning/sectioningMachineTypes";

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
  backToPrep: () => void;
  confirmOperation: () => void;
  context: SectioningContext;
};

export const SectioningPageContext = React.createContext<
  Maybe<SectioningPageContextType>
>(null);

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Sectioning({ sectioningInfo }: SectioningParams) {
  const [current, send] = useMachine(() => {
    const inputLabwareTypeNames = [LabwareTypeName.PROVIASETTE];
    const outputLabwareTypeNames = [
      LabwareTypeName.TUBE,
      LabwareTypeName.SLIDE,
      LabwareTypeName.VISIUM_TO,
      LabwareTypeName.VISIUM_LP,
    ];

    const inputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
      inputLabwareTypeNames.includes(lt.name as LabwareTypeName)
    );
    const outputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
      outputLabwareTypeNames.includes(lt.name as LabwareTypeName)
    );
    const selectedLabwareType = outputLabwareTypes[0];
    const comments = sectioningInfo.comments;

    return sectioningMachine.withContext(
      Object.assign({}, sectioningMachine.context, {
        inputLabwareTypeNames,
        outputLabwareTypeNames,
        inputLabwareTypes,
        outputLabwareTypes,
        selectedLabwareType,
        comments,
      })
    );
  });

  const sectioningPageContext: SectioningPageContextType = useMemo(() => {
    return {
      addLabwareLayout(): void {
        send({ type: "ADD_LABWARE_LAYOUT" });
      },
      backToPrep(): void {
        send({ type: "BACK_TO_PREP" });
      },
      confirmOperation(): void {
        send({ type: "CONFIRM_OPERATION" });
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
        current.context.sectioningLayouts.length ===
          current.context.numSectioningLayoutsComplete,
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
      context: current.context,
    };
  }, [current, send]);

  const showConfirm = current.matches("confirming") || current.matches("done");

  return (
    <SectioningPageContext.Provider value={sectioningPageContext}>
      {showConfirm ? <Confirm /> : <Plan />}
    </SectioningPageContext.Provider>
  );
}

export default Sectioning;
