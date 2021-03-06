import { Factory } from "fishery";
import { Slot } from "../../types/sdk";
import { sampleFactory } from "./sampleFactory";

export const slotFactory = Factory.define<Slot>(
  ({ params, associations, transientParams }) => {
    return {
      __typename: "Slot",
      address: params.address ?? "A1",
      block: params.block ?? false,
      samples:
        associations.samples ??
        sampleFactory.buildList(transientParams.numberOfSamples ?? 0),
      labwareId: params.labwareId ?? 1,
      blockHighestSection: Math.ceil(Math.random() * 20),
    };
  }
);

export const emptySlotFactory = slotFactory.params({});
export const filledSlotFactory = slotFactory.transient({ numberOfSamples: 1 });
