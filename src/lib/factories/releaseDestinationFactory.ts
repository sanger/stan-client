import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import { ReleaseDestinationFieldsFragment } from "../../types/sdk";

export default Factory.define<ReleaseDestinationFieldsFragment>(
  ({ params }) => ({
    __typename: "ReleaseDestination",
    name: params.name ?? faker.name.jobArea(),
    enabled: params.enabled ?? true,
  })
);
