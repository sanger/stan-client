import { Factory } from 'fishery';
import { LabelType } from '../../types/sdk';

export default Factory.define<LabelType>(({ sequence, params }) => ({
  __typename: 'LabelType',
  name: params.name ?? `Label Type ${sequence}`
}));
