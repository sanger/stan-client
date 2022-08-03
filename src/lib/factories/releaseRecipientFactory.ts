import faker from 'faker';
import { Factory } from 'fishery';
import { ReleaseRecipientFieldsFragment } from '../../types/sdk';

export default Factory.define<ReleaseRecipientFieldsFragment>(({ params, sequence }) => ({
  __typename: 'ReleaseRecipient',
  username: params.username ?? faker.name.firstName(),
  enabled: params.enabled ?? true
}));
