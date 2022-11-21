import { ProgramFieldsFragment } from '../../types/sdk';
import programFactory from '../../lib/factories/programFactory';
import { createSessionStorageRepository } from './index';

const seeds: Array<ProgramFieldsFragment> = programFactory.buildList(5);
seeds.push(programFactory.build({ enabled: false }));
seeds.push(programFactory.build({ name: 'PROGRAM_999' }));

const programRepository = createSessionStorageRepository('PROGRAMS', 'name', seeds);

export default programRepository;
