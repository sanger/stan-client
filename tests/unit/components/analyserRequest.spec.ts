import { describe } from '@jest/globals';
import { regionSamples } from '../../../src/components/xeniumAnalyser/analyserRequest';
import { Region } from '../../../src/components/xeniumAnalyser/analyser.types';
import { PlannedSectionDetails } from '../../../src/lib/machines/layout/layoutContext';
import { LabwareFlaggedFieldsFragment } from '../../../src/types/sdk';

const sectionGroup = (sampleId: number, addresses: Array<string>): PlannedSectionDetails => ({
  addresses: new Set(addresses),
  source: { sampleId, labware: {} as LabwareFlaggedFieldsFragment, newSection: '' }
});

describe('regionSamples', () => {
  it('returns no samples when there are no regions', () => {
    expect(regionSamples([])).toEqual([]);
  });

  it('returns one sample for each address of each section group, named with its region', () => {
    const regions: Array<Region> = [
      { roi: 'Region1', sectionGroups: [sectionGroup(1, ['A1', 'A2']), sectionGroup(2, ['B1'])] },
      { roi: 'Region2', sectionGroups: [sectionGroup(3, ['C1'])] }
    ];
    expect(regionSamples(regions)).toEqual([
      { address: 'A1', sampleId: 1, roi: 'Region1' },
      { address: 'A2', sampleId: 1, roi: 'Region1' },
      { address: 'B1', sampleId: 2, roi: 'Region1' },
      { address: 'C1', sampleId: 3, roi: 'Region2' }
    ]);
  });
});
