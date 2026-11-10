import { SampleRoi } from '../../types/sdk';
import { Region } from './analyser.types';

/**
 * The samples to record for a labware: one for each address of each section group in each region,
 * named with the region of interest.
 */
export const regionSamples = (regions: Array<Region>): Array<SampleRoi> =>
  regions.flatMap((region) =>
    region.sectionGroups.flatMap((section) =>
      Array.from(section.addresses).map((address) => ({
        address,
        sampleId: section.source.sampleId,
        roi: region.roi
      }))
    )
  );
