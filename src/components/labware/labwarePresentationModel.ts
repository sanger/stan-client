import { MachinePresentationModel } from "../../lib/presentationModels/machinePresentationModel";
import {
  LabwareMachineContext,
  LabwareMachineEvent,
  LabwareMachineSchema,
  Selectable,
  SelectionMode,
} from "./labware.types";
import { SlotFieldsFragment } from "../../types/graphql";

class LabwarePresentationModel extends MachinePresentationModel<
  LabwareMachineContext,
  LabwareMachineSchema,
  LabwareMachineEvent
> {
  init() {
    this.onClick = this.onClick.bind(this);
    this.onCtrlClick = this.onCtrlClick.bind(this);
    this.onShiftClick = this.onShiftClick.bind(this);
    this.setSelectionMode = this.setSelectionMode.bind(this);
    this.updateSlots = this.updateSlots.bind(this);
    this.resetSelected = this.resetSelected.bind(this);
  }

  onClick(address: string) {
    this.send({ type: "SELECT_SLOT", address });
  }

  onCtrlClick(address: string) {
    this.send({ type: "CTRL_SELECT_SLOT", address });
  }

  onShiftClick(address: string) {
    this.send({ type: "SELECT_TO_SLOT", address });
  }

  isSlotSelected(address: string) {
    return this.context.selectedAddresses.has(address);
  }

  setSelectionMode(selectionMode: SelectionMode, selectable: Selectable) {
    this.send({
      type: "CHANGE_SELECTION_MODE",
      selectionMode,
      selectable,
    });
  }

  updateSlots(slots: Array<SlotFieldsFragment>) {
    this.send({ type: "UPDATE_SLOTS", slots });
  }

  resetSelected() {
    this.send({ type: "RESET_SELECTED" });
  }
}

export default LabwarePresentationModel;
