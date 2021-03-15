import { MachinePresentationModel } from "./machinePresentationModel";
import {
  SectioningContext,
  SectioningEvent,
  SectioningSchema,
} from "../machines/sectioning/sectioningMachineTypes";
import {
  GetSectioningInfoQuery,
  LabwareLayoutFragment,
} from "../../types/graphql";

export default class SectioningPresentationModel extends MachinePresentationModel<
  SectioningContext,
  SectioningSchema,
  SectioningEvent
> {
  init() {
    this.updateLabwares = this.updateLabwares.bind(this);
    this.deleteLabwareLayout = this.deleteLabwareLayout.bind(this);
    this.selectLabwareType = this.selectLabwareType.bind(this);
    this.addLabwareLayout = this.addLabwareLayout.bind(this);
    this.prepDone = this.prepDone.bind(this);
    this.backToPrep = this.backToPrep.bind(this);
    this.confirmOperation = this.confirmOperation.bind(this);
  }

  isLabwareTableLocked(): boolean {
    return this.current.context.sectioningLayouts.length > 0;
  }

  isAddLabwareBtnEnabled(): boolean {
    return this.current.matches("started");
  }

  isNextBtnEnabled(): boolean {
    return (
      this.current.context.sectioningLayouts.length > 0 &&
      this.current.context.sectioningLayouts.length ===
        this.current.context.numSectioningLayoutsComplete
    );
  }

  updateLabwares(labwares: LabwareLayoutFragment[]) {
    this.send({ type: "UPDATE_LABWARES", labwares });
  }

  deleteLabwareLayout(index: number) {
    this.send({
      type: "DELETE_LABWARE_LAYOUT",
      index,
    });
  }

  selectLabwareType(
    labwareType: GetSectioningInfoQuery["labwareTypes"][number]
  ) {
    this.send({
      type: "SELECT_LABWARE_TYPE",
      labwareType,
    });
  }

  addLabwareLayout() {
    this.send({ type: "ADD_LABWARE_LAYOUT" });
  }

  prepDone() {
    this.send({ type: "PREP_DONE" });
  }

  backToPrep() {
    this.send({ type: "BACK_TO_PREP" });
  }

  confirmOperation() {
    this.send({ type: "CONFIRM_OPERATION" });
  }

  isConfirming() {
    return this.current.matches("confirming") || this.current.matches("done");
  }

  isStarted() {
    return this.current.matches("started");
  }

  isConfirmError() {
    return this.current.matches({ confirming: "confirmError" });
  }

  isDone() {
    return this.current.matches("done");
  }
}
