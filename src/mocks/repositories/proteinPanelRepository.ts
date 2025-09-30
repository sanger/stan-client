import { ProteinPanelFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import proteinPanelFactory from '../../lib/factories/ProteinPanelFactory';

const seeds: Array<ProteinPanelFieldsFragment> = [
  proteinPanelFactory.build({ name: 'Xenium protein Tumour subpanel' }),
  proteinPanelFactory.build({ name: 'Xenium protein Immune Checkpoint subpanel' }),
  proteinPanelFactory.build({ name: 'Xenium protein Proliferation and Differentiation subpanel' }),
  proteinPanelFactory.build({ name: 'Xenium protein Immune Cell Subpanel A' }),
  proteinPanelFactory.build({ name: 'Xenium protein Immune Cell Subpanel B' }),
  proteinPanelFactory.build({ name: 'Xenium protein Immune Cell Subpanel C' })
];

const proteinPanelRepository = createSessionStorageRepository('PROTEIN_PANEL', 'name', seeds);

export default proteinPanelRepository;
