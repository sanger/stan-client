import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { ProgramFieldsFragment } from '../../types/sdk';

export default Factory.define<ProgramFieldsFragment>(({ params }) => ({
  __typename: 'Program',
  name: params.name ?? faker.lorem.words(),
  enabled: params.enabled ?? true
}));
