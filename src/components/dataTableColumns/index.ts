import { LabwareFieldsFragment, SampleFieldsFragment, SlotFieldsFragment } from '../../types/sdk';

function joinUnique(array: string[]) {
  return Array.from(new Set<string>(array)).join(', ');
}

export function valueFromSamples(
  labwareOrSlot: LabwareFieldsFragment | SlotFieldsFragment,
  sampleFunction: (sample: SampleFieldsFragment) => string
) {
  let samples: SampleFieldsFragment[];

  if ('labwareType' in labwareOrSlot) {
    samples = labwareOrSlot.slots.flatMap((slot) => slot.samples);
  } else {
    samples = labwareOrSlot.samples;
  }

  return joinUnique(samples.map(sampleFunction));
}
