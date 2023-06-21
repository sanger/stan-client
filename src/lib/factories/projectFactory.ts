import { Factory } from 'fishery';
import { ProjectFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<ProjectFieldsFragment>(({ params }) => ({
  __typename: 'Project',
  name: params.name ?? faker.random.words(),
  enabled: params.enabled ?? true
}));
