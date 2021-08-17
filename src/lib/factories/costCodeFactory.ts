import { Factory } from "fishery";
import { CostCodeFieldsFragment } from "../../types/sdk";

export default Factory.define<CostCodeFieldsFragment>(
  ({ params, sequence }) => ({
    __typename: "CostCode",
    code: params.code ?? `S${sequence}`,
    enabled: params.enabled ?? true,
  })
);
