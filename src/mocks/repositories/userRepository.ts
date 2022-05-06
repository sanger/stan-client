import { UserFieldsFragment, UserRole } from "../../types/sdk";
import userFactory from "../../lib/factories/userFactory";
import faker from "faker";
import { createSessionStorageRepository } from "./index";

const seeds: Array<UserFieldsFragment> = [
  userFactory.build({ username: faker.random.word(), role: UserRole.Normal }),
  userFactory.build({ username: faker.random.word(), role: UserRole.Normal }),
  userFactory.build({ username: faker.random.word(), role: UserRole.Admin }),
  userFactory.build({ username: faker.random.word(), role: UserRole.Admin }),
  userFactory.build({ username: faker.random.word(), role: UserRole.Disabled }),
  userFactory.build({ username: "Test user", role: UserRole.Admin }),
];

const userRepository = createSessionStorageRepository(
  "USER",
  "username",
  seeds
);

export default userRepository;
