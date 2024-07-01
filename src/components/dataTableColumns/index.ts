import {
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SampleFieldsFragment,
  SlotFieldsFragment
} from '../../types/sdk';

export function joinUnique(array: string[]) {
  return Array.from(new Set<string>(array)).join(', ');
}

export const samplesFromLabwareOrSLot = (
  labwareOrSlot: LabwareFlaggedFieldsFragment | LabwareFieldsFragment | SlotFieldsFragment
): SampleFieldsFragment[] => {
  return 'labwareType' in labwareOrSlot ? labwareOrSlot.slots.flatMap((slot) => slot.samples) : labwareOrSlot.samples;
};

export function valueFromSamples(
  labwareOrSlot: LabwareFlaggedFieldsFragment | LabwareFieldsFragment | SlotFieldsFragment,
  sampleFunction: (sample: SampleFieldsFragment) => string
) {
  const samples = samplesFromLabwareOrSLot(labwareOrSlot);
  return joinUnique(samples.map(sampleFunction));
}
