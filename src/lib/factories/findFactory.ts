import { Factory } from "fishery";
import { FindEntry } from "../../types/graphql";

export const findEntryFactory = Factory.define<FindEntry>(({ sequence }) => ({
  __typename: "FindEntry",
  labwareId: sequence + 1000,
  sampleId: sequence + 10000,
}));
