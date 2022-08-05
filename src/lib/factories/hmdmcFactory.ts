import { Factory } from 'fishery';
import { HmdmcFieldsFragment } from '../../types/sdk';
import _ from 'lodash';

export default Factory.define<HmdmcFieldsFragment>(({ sequence, params }) => ({
  __typename: 'Hmdmc',
  hmdmc: params.hmdmc ?? `${_.random(1, 99)}-${_.random(100, 10000)}`,
  enabled: params.enabled ?? true
}));
