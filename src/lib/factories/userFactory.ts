import { Factory } from "fishery";
import { UserFieldsFragment, UserRole } from "../../types/sdk";
import * as faker from "faker";
import _ from "lodash";

export default Factory.define<UserFieldsFragment>(({ params }) => ({
  __typename: "User",
  username: params.username ?? faker.random.word(),
  role: Object.values(UserRole)[_.random(4)],
}));
