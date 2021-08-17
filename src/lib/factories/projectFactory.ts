import { Factory } from "fishery";
import { ProjectFieldsFragment } from "../../types/sdk";
import * as faker from "faker";

export default Factory.define<ProjectFieldsFragment>(({ params }) => ({
  __typename: "Project",
  name: params.name ?? faker.random.words(),
  enabled: params.enabled ?? true,
}));
