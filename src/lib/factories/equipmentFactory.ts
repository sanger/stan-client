import { Factory } from 'fishery';
import { EquipmentFieldsFragment } from '../../types/sdk';
import * as faker from 'faker';

export default Factory.define<EquipmentFieldsFragment>(({ params, sequence }) => ({
  __typename: 'Equipment',
  id: params.id ?? sequence,
  name: params.name ?? `Equipment ${sequence}`,
  category: params.category ?? faker.random.word(),
  enabled: params.enabled ?? true
}));
