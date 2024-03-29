import { Factory } from 'fishery';
import { EquipmentFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<EquipmentFieldsFragment>(({ params, sequence }) => ({
  __typename: 'Equipment',
  id: params.id ?? sequence,
  name: params.name ?? `Equipment ${sequence}`,
  category: params.category ?? faker.lorem.word(),
  enabled: params.enabled ?? true
}));
