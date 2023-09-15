import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { ProbePanelFieldsFragment } from '../../types/sdk';

export default Factory.define<ProbePanelFieldsFragment>(({ params }) => ({
  __typename: 'ProbePanel',
  name: params.name ?? faker.lorem.words(),
  enabled: params.enabled ?? true
}));
