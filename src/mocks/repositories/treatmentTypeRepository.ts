import { TreatmentTypeFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';

const seeds: Array<TreatmentTypeFieldsFragment> = [
  { __typename: 'TreatmentType', name: 'Fresh frozen', enabled: true },
  { __typename: 'TreatmentType', name: 'FFPE', enabled: true },
  { __typename: 'TreatmentType', name: 'Fixed frozen', enabled: true },
  { __typename: 'TreatmentType', name: 'Paxgene', enabled: true },
  { __typename: 'TreatmentType', name: 'Mixed', enabled: true }
];

const treatmentTypeRepository = createSessionStorageRepository('TREATMENT_TYPE', 'name', seeds);

export default treatmentTypeRepository;
