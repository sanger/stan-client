import { Factory } from "fishery";
import { Slot } from "../../types/graphql";

export const slotFactory = Factory.define<Slot>(({ params }) => ({
  address: params.address ?? "A1",
  block: false,
  samples: [],
  labwareId: params.labwareId ?? 1,
}));
