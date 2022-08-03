import { Factory } from 'fishery';
import { DestructionReasonFieldsFragment } from '../../types/sdk';
import * as faker from 'faker';

export default Factory.define<DestructionReasonFieldsFragment>(({ params, sequence }) => ({
  __typename: 'DestructionReason',
  id: params.id ?? sequence,
  text: params.text ?? faker.random.words(),
  enabled: params.enabled ?? true
}));
