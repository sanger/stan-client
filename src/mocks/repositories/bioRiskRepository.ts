import { BioRisk } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import bioRiskFactory from '../../lib/factories/bioRiskFactory';

const seeds: Array<BioRisk> = bioRiskFactory.buildList(5);
seeds.push(bioRiskFactory.build({ enabled: false }));
seeds.push(bioRiskFactory.build({ code: 'bioRisk1' }));

const bioRiskRepository = createSessionStorageRepository('BIORISKS', 'code', seeds);

export default bioRiskRepository;
