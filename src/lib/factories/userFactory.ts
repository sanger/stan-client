import { Factory } from 'fishery';
import { UserFieldsFragment, UserRole } from '../../types/sdk';
import { faker } from '@faker-js/faker';
import _ from 'lodash';

export default Factory.define<UserFieldsFragment>(({ params }) => ({
  __typename: 'User',
  username: params.username ?? faker.lorem.word(),
  role: Object.values(UserRole)[_.random(4)]
}));
