import { createSessionStorageRepository } from './index';
import fileFactory from '../../lib/factories/fileFactory';
import { FileFieldsFragment } from '../../types/sdk';

const seeds: Array<FileFieldsFragment> = fileFactory.buildList(10);
seeds.push(fileFactory.build({ name: 'Test File' }));
seeds.push(fileFactory.build({ name: 'TEST999' }));

const fileRepository = createSessionStorageRepository('FILES', 'name', seeds);

export default fileRepository;
