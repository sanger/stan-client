import { Factory } from 'fishery';
import { UserFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';
import _ from 'lodash';

export default Factory.define<UserFieldsFragment>(
  ({ params }) =>
    ({
      __typename: 'User',
      username: params.username ?? faker.lorem.word(),
      role: ['disabled', 'enduser', 'normal', 'admin'][_.random(4)]
    } as UserFieldsFragment)
);
