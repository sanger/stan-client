import faker from 'faker';
import { Factory } from 'fishery';
import { ReleaseDestinationFieldsFragment } from '../../types/sdk';

export default Factory.define<ReleaseDestinationFieldsFragment>(({ params, sequence }) => ({
  __typename: 'ReleaseDestination',
  name: params.name ?? faker.name.jobArea(),
  enabled: params.enabled ?? true
}));
