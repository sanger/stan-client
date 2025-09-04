import { SpatialLocation, TissueType } from '../../types/sdk';
import { spatialLocationFactory, tissueTypeFactory } from '../../lib/factories/sampleFactory';
import { createSessionStorageRepository } from './index';

const spatialLocations: Array<SpatialLocation> = [];

const tissueTypeSeeds: Array<TissueType> = tissueTypeFactory.buildList(5).map((tissueType) => {
  const tissueSp = spatialLocationFactory.buildList(3).map((spatialLocation, index) => ({
    ...spatialLocation,
    tissueType,
    name: `${tissueType.name} sp ${index + 1}`,
    enabled: true
  }));
  spatialLocations.push(...tissueSp);
  return {
    ...tissueType,
    spatialLocations: tissueSp
  };
});

const tissueTypeRepo = createSessionStorageRepository('TISSUE_TYPE', 'name', tissueTypeSeeds);
export const spatialLocationRepo = createSessionStorageRepository('SPATIAL_LOCATION', 'name', spatialLocations);

export default tissueTypeRepo;
