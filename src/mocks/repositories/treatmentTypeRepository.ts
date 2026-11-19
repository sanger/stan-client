import { TreatmentTypeFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';

const seeds: Array<TreatmentTypeFieldsFragment> = [
  { name: 'Fresh frozen', enabled: true },
  { name: 'FFPE', enabled: true },
  { name: 'Fixed frozen', enabled: true },
  { name: 'Paxgene', enabled: true },
  { name: 'Mixed', enabled: true }
];

const treatmentTypeRepository = createSessionStorageRepository('TREATMENT_TYPE', 'name', seeds);

export default treatmentTypeRepository;
