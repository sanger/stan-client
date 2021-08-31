import { Factory } from "fishery";
import { FixativeFieldsFragment } from "../../types/sdk";

export default Factory.define<FixativeFieldsFragment>(
  ({ params, sequence }) => ({
    __typename: "Fixative",
    name: params.name ?? `Fixative ${sequence}`,
    enabled: params.enabled ?? true,
  })
);
