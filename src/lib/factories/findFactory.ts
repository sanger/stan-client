import { Factory } from "fishery";
import { FindEntry } from "../../types/sdk";

export const findEntryFactory = Factory.define<FindEntry>(({ sequence }) => ({
  __typename: "FindEntry",
  labwareId: sequence + 1000,
  sampleId: sequence + 10000,
  workNumbers: [`SGP-${sequence}`]
}));
