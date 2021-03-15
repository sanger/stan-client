import { Factory } from "fishery";
import { LabelType } from "../../types/graphql";

export default Factory.define<LabelType>(({ sequence }) => ({
  __typename: "LabelType",
  name: `Label Type ${sequence}`,
}));
