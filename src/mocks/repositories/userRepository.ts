import { UserFieldsFragment, UserRole } from '../../types/sdk';
import userFactory from '../../lib/factories/userFactory';
import { faker } from '@faker-js/faker';
import { createSessionStorageRepository } from './index';

const seeds: Array<UserFieldsFragment> = [
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Normal }) as UserFieldsFragment,
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Normal }) as UserFieldsFragment,
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Admin }) as UserFieldsFragment,
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Admin }) as UserFieldsFragment,
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Enduser }) as UserFieldsFragment,
  userFactory.build({ username: faker.lorem.word(), role: UserRole.Disabled }) as UserFieldsFragment,
  userFactory.build({ username: 'Test user', role: UserRole.Admin }) as UserFieldsFragment
];

const userRepository = createSessionStorageRepository('USER', 'username', seeds);

export default userRepository;
