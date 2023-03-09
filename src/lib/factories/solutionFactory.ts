import { Factory } from 'fishery';
import { SolutionFieldsFragment } from '../../types/sdk';

export default Factory.define<SolutionFieldsFragment>(({ params, sequence }) => ({
  __typename: 'Solution',
  name: params.name ?? `Solution ${sequence}`,
  enabled: params.enabled ?? true
}));
