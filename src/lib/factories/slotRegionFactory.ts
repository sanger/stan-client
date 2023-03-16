import { Factory } from 'fishery';
import { SlotRegionFieldsFragment } from '../../types/sdk';

export default Factory.define<SlotRegionFieldsFragment>(({ params, sequence }) => ({
  __typename: 'SlotRegion',
  name: params.name ?? `Slot Region ${sequence}`,
  enabled: params.enabled ?? true
}));
