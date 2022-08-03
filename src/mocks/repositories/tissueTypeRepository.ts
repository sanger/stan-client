import { TissueType } from '../../types/sdk';
import { tissueTypeFactory } from '../../lib/factories/sampleFactory';
import { createSessionStorageRepository } from './index';

const tissueTypeSeeds: Array<TissueType> = tissueTypeFactory.buildList(5);

const tissueTypeRepo = createSessionStorageRepository('TISSUE_TYPE', 'name', tissueTypeSeeds);

export default tissueTypeRepo;
