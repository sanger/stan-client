import { Factory } from 'fishery';
import { DnapStudyFieldsFragment } from '../../types/sdk';

export default Factory.define<DnapStudyFieldsFragment>(({ params, sequence }) => ({
  __typename: 'DnapStudy',
  name: params.name ?? `DnapStudy ${sequence}`,
  enabled: params.enabled ?? true
}));
