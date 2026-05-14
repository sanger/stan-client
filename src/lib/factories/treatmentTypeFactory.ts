import { Factory } from 'fishery';
import { TreatmentType } from '../../types/sdk';

export default Factory.define<TreatmentType>(({ params, sequence }) => ({
  __typename: 'TreatmentType',
  name: params.name ?? `Treatment Type ${sequence}`,
  enabled: params.enabled ?? true
}));
