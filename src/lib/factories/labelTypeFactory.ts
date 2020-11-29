import { Factory } from "fishery";
import { LabelType } from "../../types/graphql";

export default Factory.define<LabelType>(({ sequence }) => ({
  name: `Label Type ${sequence}`,
}));
