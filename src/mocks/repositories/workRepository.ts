import { WorkFieldsFragment, WorkStatus } from '../../types/sdk';
import workFactory from '../../lib/factories/workFactory';
import { createSessionStorageRepository } from './index';
import treatmentTypeRepository from './treatmentTypeRepository';

const workSeeds: Array<WorkFieldsFragment> = [
  ...workFactory.buildList(4),
  workFactory.build(undefined, { transient: { isRnD: true } }),
  // attach treatment types to some example works for fixtures
  workFactory.build({ status: WorkStatus.Paused, treatmentTypes: treatmentTypeRepository.findAll().slice(0, 1) }),
  workFactory.build({ status: WorkStatus.Failed, treatmentTypes: treatmentTypeRepository.findAll().slice(1, 2) }),
  workFactory.build({ status: WorkStatus.Active, treatmentTypes: treatmentTypeRepository.findAll().slice(0, 2) }),
  workFactory.build({ status: WorkStatus.Active }),
  workFactory.build({ status: WorkStatus.Active }),
  workFactory.build({ status: WorkStatus.Active }),
  workFactory.build({ workType: { name: 'Work Type 1', enabled: true } })
];

const workRepository = createSessionStorageRepository('WORK', 'workNumber', workSeeds);

export default workRepository;
