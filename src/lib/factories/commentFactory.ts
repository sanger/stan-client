import { Factory } from 'fishery';
import { CommentFieldsFragment } from '../../types/sdk';
import { faker } from '@faker-js/faker';

export default Factory.define<CommentFieldsFragment>(({ params, sequence }) => ({
  __typename: 'Comment',
  id: params.id ?? sequence,
  category: params.category ?? faker.random.word(),
  text: params.text ?? faker.random.words(5),
  enabled: params.enabled ?? true
}));
