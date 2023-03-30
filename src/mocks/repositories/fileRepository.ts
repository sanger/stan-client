import { createSessionStorageRepository } from './index';
import fileFactory from '../../lib/factories/fileFactory';
import { FileFieldsFragment } from '../../types/sdk';

const seeds: Array<FileFieldsFragment> = fileFactory.buildList(10);
seeds.push(fileFactory.build({ name: 'Test File', work: { workNumber: 'SGP1008' } }));
seeds.push(fileFactory.build({ name: 'TEST999', work: { workNumber: 'SGP1009' } }));

const fileRepository = createSessionStorageRepository('FILES', 'name', seeds);

export default fileRepository;
