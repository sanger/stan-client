import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { ReleaseRecipientFieldsFragment } from '../../types/sdk';

export default Factory.define<ReleaseRecipientFieldsFragment>(({ params }) => ({
  __typename: 'ReleaseRecipient',
  username: params.username ?? faker.person.firstName(),
  enabled: params.enabled ?? true
}));
