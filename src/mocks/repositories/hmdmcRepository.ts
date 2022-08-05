import { HmdmcFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import hmdmcFactory from '../../lib/factories/hmdmcFactory';

const seeds: Array<HmdmcFieldsFragment> = [
  hmdmcFactory.build({ hmdmc: 'HuMFre1' }),
  hmdmcFactory.build({ hmdmc: 'HuMFre2' }),
  hmdmcFactory.build({ hmdmc: 'HuMFre3' }),
  hmdmcFactory.build({ hmdmc: 'HuMFre4' }),
  hmdmcFactory.build({ hmdmc: 'HuMFre5', enabled: false })
];

const hmdmcRepository = createSessionStorageRepository('HMDMC', 'hmdmc', seeds);

export default hmdmcRepository;
