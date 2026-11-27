import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { ReleaseRecipientFieldsFragment } from '../../types/sdk';

export default Factory.define<ReleaseRecipientFieldsFragment>(({ params }) => ({
  __typename: 'ReleaseRecipient',
  fullName: params.fullName ?? null,
  username: params.username ?? faker.person.firstName(),
  enabled: params.enabled ?? true
}));
