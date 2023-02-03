import { OmeroProjectFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import omeroProjectFactory from '../../lib/factories/omeroProjectFactory';

const seeds: Array<OmeroProjectFieldsFragment> = omeroProjectFactory.buildList(5);
seeds.push(omeroProjectFactory.build({ enabled: false }));
seeds.push(omeroProjectFactory.build({ name: 'OMERO_TEST999' }));

const projectRepository = createSessionStorageRepository('OMEROPROJECTS', 'name', seeds);

export default projectRepository;
