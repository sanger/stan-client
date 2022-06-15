import { Factory } from "fishery";
import { SolutionSampleFieldsFragment } from "../../types/sdk";

export default Factory.define<SolutionSampleFieldsFragment>(
  ({ params, sequence }) => ({
    __typename: "SolutionSample",
    name: params.name ?? `Sample ${sequence}`,
    enabled: params.enabled ?? true,
  })
);
