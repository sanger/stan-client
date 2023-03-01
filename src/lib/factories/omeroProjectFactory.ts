import { Factory } from 'fishery';
import { OmeroProjectFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<OmeroProjectFieldsFragment>(({ params }) => ({
  __typename: 'OmeroProject',
  name: params.name ?? faker.random.words(),
  enabled: params.enabled ?? true
}));
