import { Factory } from 'fishery';
import { ProteinPanelFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<ProteinPanelFieldsFragment>(({ params }) => ({
  __typename: 'ProteinPanel',
  name: params.name ?? faker.lorem.words(),
  enabled: params.enabled ?? true
}));
