import { Labware, LabwareFieldsFragment, LabwareState, LabwareType, SlotFieldsFragment } from '../../types/sdk';
import { cycleColors } from '../helpers';
import { orderBy } from 'lodash';
import { Addressable, LabwareTypeName } from '../../types/stan';
import * as slotHelper from './slotHelper';

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
export function labwareSamples(labware: LabwareFieldsFragment) {
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
export function buildSampleColors(labwares: LabwareFieldsFragment[]): Map<number, string> {
  const colors = cycleColors();
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
