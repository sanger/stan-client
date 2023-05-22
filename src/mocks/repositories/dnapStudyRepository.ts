import { DnapStudyFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import dnapStudyFactory from '../../lib/factories/dnapStudyFactory';

const seeds: Array<DnapStudyFieldsFragment> = [
  dnapStudyFactory.build({ name: 'S10315 - Orphan Tumour Study_NB_sNuc', enabled: true }),
  dnapStudyFactory.build({ name: 'S20315 - Liver Study_NB_sXtyhkghpyuo00', enabled: true }),
  dnapStudyFactory.build({ name: 'S30315 - Kidney Study_NB', enabled: true }),
  dnapStudyFactory.build({ name: 'S40315 - Heart Study_NB', enabled: true })
];

const dnapStudyRepository = createSessionStorageRepository('DNAPSTUDIES', 'name', seeds);

export default dnapStudyRepository;
