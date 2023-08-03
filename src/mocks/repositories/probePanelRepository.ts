import { ProbePanelFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import probePanelFactory from '../../lib/factories/probePanelFactory';

const seeds: Array<ProbePanelFieldsFragment> = probePanelFactory.buildList(5);
seeds.push(probePanelFactory.build({ enabled: false }));
seeds.push(probePanelFactory.build({ name: 'Standard breast' }));
seeds.push(probePanelFactory.build({ name: 'Standard brain' }));
seeds.push(probePanelFactory.build({ name: ' Custom breast' }));

const probePanelRepository = createSessionStorageRepository('PROBE_PANELS', 'name', seeds);

export default probePanelRepository;
