import { Factory } from "fishery";
import { WorkTypeFieldsFragment } from "../../types/sdk";

export default Factory.define<WorkTypeFieldsFragment>(
  ({ params, sequence }) => ({
    __typename: "WorkType",
    name: params.name ?? `Work Type ${sequence}`,
    enabled: params.enabled ?? true,
  })
);
