import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { ProgramFieldsFragment } from '../../types/sdk';

export default Factory.define<ProgramFieldsFragment>(({ params }) => ({
  __typename: 'Program',
  name: params.name ?? faker.random.words(),
  enabled: params.enabled ?? true
}));
