import {
  Labware,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareState,
  LabwareType,
  SlotFieldsFragment
} from '../../types/sdk';
import { backgroundColorClassNames } from '../helpers';
import { orderBy } from 'lodash';
import { Addressable, LabwareTypeName } from '../../types/stan';
import * as slotHelper from './slotHelper';
import { PlannedSectionDetails } from '../machines/layout/layoutContext';

/**
 * Determines whether a labware type is a tube or not.
 * @param maybeTube the labware type that might be a tube
 * @return true if maybeTube is a tube; false otherwise
 */
export function isTube(maybeTube: Pick<LabwareType, 'name'>): boolean {
  return maybeTube.name === LabwareTypeName.TUBE;
}

/**
 * Build an array of all {@link Sample samples} in a {@link Labware} along with its {@link Slot} plus the original {@link Labware}
 * @param labware a {@link LabwareFieldsFragment}
 */
export function labwareSamples(labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment) {
  return labware.slots
    .map((slot) => {
      return slot.samples.map((sample) => {
        return { sample, slot, labware };
      });
    })
    .flat();
}

/**
 * Returns a Map of sample ID to a color
 *
 * @param labwares list of labwares to get colors for
 */
export function buildSampleColors(
  labwares: LabwareFieldsFragment[] | LabwareFlaggedFieldsFragment[]
): Map<number, string> {
  const colors = backgroundColorClassNames();
  const sampleColors = new Map();
  labwares.forEach((labware) => {
    labwareSamples(labware).forEach((value) => {
      if (!sampleColors.has(value.sample.id)) {
        sampleColors.set(value.sample.id, colors.next().value);
      }
    });
  });
  return sampleColors;
}

export function getRowIndex(address: string): number {
  return address.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
}

export function getColumnIndex(address: string): number {
  return parseInt(address.substr(1));
}

export function sortRightDown<T extends Addressable>(addressable: Array<T>): Array<T> {
  return orderBy(addressable, [(a) => getRowIndex(a.address), (a) => getColumnIndex(a.address)], ['asc', 'asc']);
}

export function sortDownRight<T extends Addressable>(addressable: Array<T>): Array<T> {
  return orderBy(addressable, [(a) => getColumnIndex(a.address), (a) => getRowIndex(a.address)], ['asc', 'asc']);
}

/**
 * Returns the filled slots for the given labware
 * @param labware a {@link LabwareFieldsFragment}
 */
export function filledSlots(labware: LabwareFieldsFragment): Array<SlotFieldsFragment> {
  return slotHelper.filledSlots(labware.slots);
}

/**
 * Returns the empty slots for the given labware
 * @param labware a {@link LabwareFieldsFragment}
 */
export function emptySlots(labware: LabwareFieldsFragment): Array<SlotFieldsFragment> {
  return slotHelper.emptySlots(labware.slots);
}

/**
 * Build a {@type LabwareFieldsFragment} from a {@type Labware}
 */
export function buildLabwareFragment(labware: Labware): LabwareFieldsFragment {
  return {
    __typename: 'Labware',
    id: labware.id,
    barcode: labware.barcode,
    externalBarcode: labware.externalBarcode,
    destroyed: labware.destroyed,
    discarded: labware.discarded,
    released: labware.released,
    created: labware.created,
    state: labware.state,
    labwareType: {
      __typename: 'LabwareType',
      name: labware.labwareType.name,
      numRows: labware.labwareType.numRows,
      numColumns: labware.labwareType.numColumns,
      labelType: labware.labwareType.labelType
    },
    slots: labware.slots.map((slot) => ({
      __typename: 'Slot',
      id: slot.id,
      address: slot.address,
      labwareId: slot.labwareId,
      blockHighestSection: slot.blockHighestSection,
      block: slot.block,
      samples: slot.samples.map((sample) => ({
        id: sample.id,
        section: sample.section,
        bioState: {
          __typename: 'BioState',
          name: sample.bioState.name
        },
        tissue: {
          donor: {
            donorName: sample.tissue.donor.donorName,
            lifeStage: sample.tissue.donor.lifeStage,
            __typename: 'Donor'
          },
          externalName: sample.tissue.externalName,
          spatialLocation: {
            tissueType: {
              name: sample.tissue.spatialLocation.tissueType.name,
              __typename: 'TissueType'
            },
            name: sample.tissue.spatialLocation.name,
            code: sample.tissue.spatialLocation.code,
            __typename: 'SpatialLocation'
          },
          replicate: sample.tissue.replicate,
          medium: {
            name: sample.tissue.medium.name,
            __typename: 'Medium'
          },
          fixative: {
            name: sample.tissue.fixative.name,
            enabled: sample.tissue.fixative.enabled,
            __typename: 'Fixative'
          },
          __typename: 'Tissue'
        },
        __typename: 'Sample'
      }))
    }))
  };
}

/**
 * Returns true if a piece of labware is usable; false otherwise.
 */
export function isLabwareUsable(labware: Pick<Labware, 'state'>): boolean {
  return [LabwareState.Empty, LabwareState.Active].includes(labware.state);
}

/**
 * Determines whether a piece of labware has one slot which contains a block
 * e.g. a non-empty Proviasette
 * @param labware the labware to check
 * @return true if labware has one slot with a block inside; false otherwise
 */
export function hasBlock(labware: Pick<LabwareFieldsFragment, 'slots'>): boolean {
  return labware.slots.length === 1 && labware.slots[0].block;
}

/**
 *
 * @param labware the labware to check
 * @return tissue in first sample in first slot if exists otherwise undefined
 */
export const tissue = (labware: LabwareFieldsFragment | undefined) => {
  if (
    labware &&
    labware.slots &&
    labware.slots.length > 0 &&
    labware.slots[0].samples.length > 0 &&
    labware.slots[0].samples[0].tissue
  )
    return labware.slots[0].samples[0].tissue;
  else return undefined;
};

/**
 *
 * @param labware the labware to check
 * @return tissues of all samples across all slots
 */
export const tissues = (labware: LabwareFieldsFragment | undefined) => {
  if (labware && labware.slots && labware.slots.length > 0 && labware.slots.some((slot) => slot.samples.length > 0))
    return labware.slots.flatMap((slot) => slot.samples.map((sample) => sample.tissue));
  else return [];
};

/**
 * Checks whether the given labware has samples in any of its slots.
 * @param labware - The labware to check for samples.
 * @returns `true` if samples are found in any slot, `false` otherwise.
 */
export const hasSamples = (labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment): boolean => {
  return labware.slots.some((slot) => slot.samples && slot.samples.length > 0);
};

/**
 * Converts an array of Labware objects to an array of Flagged Labware objects.
 *
 * @param labware - An array of Labware objects to be converted.
 * @returns An array of Flagged Labware objects with the 'flagged' property set to false.
 */
export const convertLabwareToFlaggedLabware = (labware: LabwareFieldsFragment[]): LabwareFlaggedFieldsFragment[] => {
  return labware.map((lw) => ({ __typename: 'LabwareFlagged', flagged: false, ...lw }) as LabwareFlaggedFieldsFragment);
};

/**
 * Extracts Labware objects from an array of Flagged Labware objects.
 *
 * @param flagged - An array of Flagged Labware objects to extract Labware from.
 * @returns An array of Labware objects without the 'flagged' property.
 */
export const extractLabwareFromFlagged = (flagged: LabwareFlaggedFieldsFragment[]): LabwareFieldsFragment[] => {
  return flagged.map(({ flagged, ...rest }) => rest as LabwareFieldsFragment);
};

/**
 * Groups labware slots by sample and section number, then returns the groups
 * ordered by section number and re-indexed with sequential numeric keys.
 *
 * Each group represents a planned section created during the sectioning operation,
 * identified by a combination of `sample.id` and `sample.section`.
 *
 * For each group, all slot addresses containing the same sample in the same section
 * are collected together. This allows the UI and downstream logic to reconstruct
 * section groupings that span multiple slots.
 *
 * Groups are sorted by `sectionNumber` (`sample.section`) in ascending order before
 * being re-indexed. The resulting numeric keys (starting from 0) are used by the UI
 * layer to consistently map section groups to layout colours.
 *
 * Slots containing samples without a section number are ignored.
 */
export const sectionGroupsBySample = (
  labware: LabwareFieldsFragment | LabwareFlaggedFieldsFragment
): Record<string, PlannedSectionDetails> => {
  const sectionGroups: Record<string, PlannedSectionDetails> = {};
  labware.slots.forEach((slot) => {
    slot.samples.forEach((sample) => {
      if (sample.section == null) return;
      const key = `${sample.id}-${sample.section}`;
      const group = (sectionGroups[key] ??= {
        addresses: new Set<string>(),
        source: {
          sampleId: sample.id,
          labware: labware,
          newSection: sample.section,
          tissue: sample.tissue
        }
      });
      group.addresses.add(slot.address);
    });
  });

  // Group by tissue external name to ensure sections from the same tissue are together in the final ordering
  const grouped = Object.values(sectionGroups).reduce<Record<string, PlannedSectionDetails[]>>((acc, section) => {
    const key = section.source.tissue?.externalName ?? '';
    (acc[key] ??= []).push(section);
    return acc;
  }, {});

  // Ordering within each tissue group by section number - ascending ordered
  const sorted = Object.values(grouped).flatMap((group) =>
    group.sort((a, b) => a.source.newSection - b.source.newSection)
  );

  return Object.fromEntries(sorted.map((sectionDetails, index) => [index, sectionDetails]));
};
