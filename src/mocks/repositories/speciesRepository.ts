import { SpeciesFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import speciesFactory from '../../lib/factories/speciesFactory';
import { HUMAN_NAME } from '../../lib/constants';

const speciesSeeds: Array<SpeciesFieldsFragment> = [
  speciesFactory.build({ name: HUMAN_NAME }),
  speciesFactory.build({ name: 'Mouse' }),
  speciesFactory.build({ name: 'Pig' }),
  speciesFactory.build({ name: 'Hamster' })
];

const speciesRepository = createSessionStorageRepository('SPECIES', 'name', speciesSeeds);

export default speciesRepository;
