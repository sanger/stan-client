import { MachinePresentationModel } from "./machinePresentationModel";
import {
  SlotCopyContext,
  SlotCopyEvent,
  SlotCopySchema,
} from "../machines/slotCopy/slotCopyMachineTypes";
import { LabwareLayoutFragment, SlotCopyContent } from "../../types/graphql";

export default class SlotCopyPresentationModel extends MachinePresentationModel<
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent
> {
  init() {
    this.handleOnSlotMapperChange = this.handleOnSlotMapperChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleOnSlotMapperChange(
    slotCopyContent: Array<SlotCopyContent>,
    allSourcesMapped: boolean
  ) {
    this.send({
      type: "UPDATE_SLOT_COPY_CONTENT",
      slotCopyContent,
      allSourcesMapped,
    });
  }

  handleSave() {
    this.send({ type: "SAVE" });
  }

  get isSlotMapperLocked(): boolean {
    return this.current.matches("copied");
  }

  get outputLabwares(): Array<LabwareLayoutFragment> {
    return this.context.outputLabwares;
  }

  get isBlueButtonDisabled(): boolean {
    return !this.current.matches("readyToCopy");
  }
}
