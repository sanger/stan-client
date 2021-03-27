import { MachinePresentationModel } from "../../lib/presentationModels/machinePresentationModel";
import {
  SlotMapperContext,
  SlotMapperEvent,
  SlotMapperSchema,
} from "./slotMapper.types";
import { NewLabwareLayout } from "../../types/stan";
import { LabwareLayoutFragment, SlotFieldsFragment } from "../../types/graphql";
import * as labwareHelper from "../../lib/helpers/labwareHelper";
import { find, findIndex } from "lodash";

class SlotMapperPresentationModel extends MachinePresentationModel<
  SlotMapperContext,
  SlotMapperSchema,
  SlotMapperEvent
> {
  init() {
    this.updateInputLabware = this.updateInputLabware.bind(this);
  }

  updateInputLabware(labware: Array<LabwareLayoutFragment>) {
    this.send({ type: "UPDATE_INPUT_LABWARE", labware });
  }

  copySlots(
    inputLabwareId: number,
    inputAddresses: Array<string>,
    outputLabwareId: number,
    outputAddress: string
  ) {
    if (inputAddresses.length === 0) {
      return;
    }
    this.send({
      type: "COPY_SLOTS",
      inputLabwareId,
      inputAddresses,
      outputLabwareId,
      outputAddress,
    });
  }

  lock() {
    this.send({ type: "LOCK" });
  }

  unlock() {
    this.send({ type: "UNLOCK" });
  }

  getSourceSlotColor(
    labware: LabwareLayoutFragment,
    address: string,
    slot: SlotFieldsFragment
  ) {
    if (
      find(this.context.slotCopyContent, {
        sourceBarcode: labware.barcode,
        sourceAddress: address,
      })
    ) {
      return `bg-${this.colorByBarcode(labware.barcode)}-200`;
    }

    if (slot?.samples?.length) {
      return `bg-${this.colorByBarcode(labware.barcode)}-500`;
    }
  }

  getDestinationSlotColor(labware: NewLabwareLayout, address: string) {
    const scc = find(this.context.slotCopyContent, {
      destinationAddress: address,
    });

    if (scc) {
      return `bg-${this.colorByBarcode(scc.sourceBarcode)}-500`;
    }
  }

  get allSourcesMapped(): boolean {
    const inputLabware = this.context.inputLabware;

    if (inputLabware.length === 0) {
      return false;
    }

    // List of [labwareBarcode, slotAddress] tuples for all filled slots of the source labwares
    const allSources: Array<readonly [string, string]> = inputLabware.flatMap(
      (lw) => {
        return labwareHelper
          .filledSlots(lw)
          .map((slot) => [lw.barcode, slot.address]);
      }
    );

    // Is every source in slotCopyContent?
    return allSources.every(([sourceBarcode, sourceAddress]) => {
      return (
        findIndex(this.context.slotCopyContent, {
          sourceBarcode,
          sourceAddress,
        }) !== -1
      );
    });
  }

  colorByBarcode(barcode: string) {
    return this.context.colorByBarcode.get(barcode);
  }

  clearSlots(outputLabwareId: number, outputAddresses: Array<string>) {
    this.send({ type: "CLEAR_SLOTS", outputLabwareId, outputAddresses });
  }
}

export default SlotMapperPresentationModel;
