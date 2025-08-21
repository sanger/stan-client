import { ProbePanelFieldsFragment, ProbeType } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import probePanelFactory from '../../lib/factories/probePanelFactory';

const seeds: Array<ProbePanelFieldsFragment> = [];
seeds.push(probePanelFactory.build({ enabled: false }));
seeds.push(probePanelFactory.build({ type: ProbeType.Xenium, name: 'Xenium APT gene expression panel' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Xenium, name: 'Xenium ABCFX8 mBrain 100g gene panel' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Xenium, name: 'Xenium Human Colon Gene Expression Panel' }));

seeds.push(probePanelFactory.build({ enabled: false }));
seeds.push(probePanelFactory.build({ type: ProbeType.Cytassist, name: 'CytAssist APT gene expression panel' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Cytassist, name: 'CytAssist ABCFX8 mBrain 100g gene panel' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Cytassist, name: 'CytAssist Human Colon Gene Expression Panel' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Cytassist, name: 'Human WT Probes' }));

seeds.push(probePanelFactory.build({ enabled: false }));
seeds.push(probePanelFactory.build({ type: ProbeType.Spike, name: 'Custom spike 1' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Spike, name: 'Custom spike 2' }));
seeds.push(probePanelFactory.build({ type: ProbeType.Spike, name: 'Custom spike 3' }));

const probePanelRepository = createSessionStorageRepository('PROBE_PANELS', 'name', seeds);

export default probePanelRepository;
