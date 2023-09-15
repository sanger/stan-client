import { Factory } from 'fishery';
import { FileFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<FileFieldsFragment>(({ params }) => ({
  __typename: 'StanFile',
  name: params.name ?? faker.lorem.words(),
  created: params.created ?? faker.date.past().toDateString(),
  work: {
    __typename: 'Work',
    workNumber: params.work?.workNumber ?? ''
  },
  url: params.url ?? ''
}));
