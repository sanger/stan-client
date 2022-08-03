import { Factory } from 'fishery';
import { StainTypeFieldsFragment } from '../../types/sdk';

export default Factory.define<StainTypeFieldsFragment>(({ sequence, params }) => ({
  __typename: 'StainType',
  name: params.name ?? `Stain Type ${sequence}`,
  measurementTypes: params.measurementTypes ?? []
}));
