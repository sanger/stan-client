import { WorkTypeFieldsFragment } from '../../types/sdk';
import workTypeFactory from '../../lib/factories/workTypeFactory';
import { createSessionStorageRepository } from './index';

const workTypeSeeds: Array<WorkTypeFieldsFragment> = [
  ...workTypeFactory.buildList(3),
  workTypeFactory.build({ name: 'TEST_WT_1' }),
  workTypeFactory.build({ enabled: false })
];

const workTypeRepository = createSessionStorageRepository('WORK_TYPE', 'name', workTypeSeeds);

export default workTypeRepository;
