import { Factory } from "fishery";
import { LabelType } from "../../types/sdk";

export default Factory.define<LabelType>(({ sequence }) => ({
  __typename: "LabelType",
  name: `Label Type ${sequence}`,
}));
