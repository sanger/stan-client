import { WorkFieldsFragment, WorkStatus } from '../../types/sdk';
import workFactory from '../../lib/factories/workFactory';
import { createSessionStorageRepository } from './index';

const workSeeds: Array<WorkFieldsFragment> = [
  ...workFactory.buildList(4),
  workFactory.build(undefined, { transient: { isRnD: true } }),
  workFactory.build({ status: WorkStatus.Paused }),
  workFactory.build({ status: WorkStatus.Failed }),
  workFactory.build({ status: WorkStatus.Active }),
  workFactory.build({ workType: { name: 'Work Type 1', enabled: true } })
];

const workRepository = createSessionStorageRepository('WORK', 'workNumber', workSeeds);

export default workRepository;
