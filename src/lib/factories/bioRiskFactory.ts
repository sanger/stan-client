import { Factory } from 'fishery';
import { BioRisk } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<BioRisk>(({ params, sequence }) => ({
  __typename: 'BioRisk',
  code: faker.lorem.word() + sequence,
  enabled: params.enabled ?? true
}));
