import { Factory } from 'fishery';
import { SpeciesFieldsFragment } from '../../types/sdk';

export default Factory.define<SpeciesFieldsFragment>(({ params, sequence }) => ({
  __typename: 'Species',
  name: params.name ?? `Species ${sequence}`,
  enabled: params.enabled ?? true
}));
