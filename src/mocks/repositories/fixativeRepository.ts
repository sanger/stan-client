import { FixativeFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import fixativeFactory from '../../lib/factories/fixativeFactory';

const fixativeSeeds: Array<FixativeFieldsFragment> = [
  fixativeFactory.build({ name: 'None' }),
  fixativeFactory.build({ name: 'Formalin' })
];

const fixativeRepository = createSessionStorageRepository('FIXATIVES', 'name', fixativeSeeds);

export default fixativeRepository;
