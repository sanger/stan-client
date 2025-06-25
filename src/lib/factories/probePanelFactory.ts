import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { ProbePanelFieldsFragment, ProbeType } from '../../types/sdk';

export default Factory.define<ProbePanelFieldsFragment>(({ params }) => ({
  __typename: 'ProbePanel',
  type: params.type ?? ProbeType.Xenium,
  name: params.name ?? faker.lorem.words(),
  enabled: params.enabled ?? true
}));
