import { faker } from "@faker-js/faker/locale/en";
import { Factory } from "fishery";
import { ReleaseRecipientFieldsFragment } from "../../types/sdk";

export default Factory.define<ReleaseRecipientFieldsFragment>(({ params }) => ({
  __typename: "ReleaseRecipient",
  username: params.username ?? faker.name.firstName(),
  enabled: params.enabled ?? true,
}));
