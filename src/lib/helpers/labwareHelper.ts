import {
  Labware,
  LabwareFieldsFragment,
  SlotFieldsFragment,
} from "../../types/graphql";
import { cycleColors } from "../helpers";
import { orderBy } from "lodash";
import { Addressable } from "../../types/stan";
import * as slotHelper from "./slotHelper";

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
export function buildSampleColors(
  labwares: LabwareFieldsFragment[]
): Map<number, string> {
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
  return address.charCodeAt(0) - "A".charCodeAt(0) + 1;
}

export function getColumnIndex(address: string): number {
  return parseInt(address.substr(1));
}

export function sortRightDown<T extends Addressable>(
  addressable: Array<T>
): Array<T> {
  return orderBy(
    addressable,
    [(a) => getRowIndex(a.address), (a) => getColumnIndex(a.address)],
    ["asc", "asc"]
  );
}

export function sortDownRight<T extends Addressable>(
  addressable: Array<T>
): Array<T> {
  return orderBy(
    addressable,
    [(a) => getColumnIndex(a.address), (a) => getRowIndex(a.address)],
    ["asc", "asc"]
  );
}

/**
 * Returns the filled slots for the given labware
 * @param labware a {@link LabwareFieldsFragment}
 */
export function filledSlots(
  labware: LabwareFieldsFragment
): Array<SlotFieldsFragment> {
  return slotHelper.filledSlots(labware.slots);
}

/**
 * Returns the empty slots for the given labware
 * @param labware a {@link LabwareFieldsFragment}
 */
export function emptySlots(
  labware: LabwareFieldsFragment
): Array<SlotFieldsFragment> {
  return slotHelper.emptySlots(labware.slots);
}

/**
 * Build a {@type LabwareFieldsFragment} from a {@type Labware}
 */
export function buildLabwareFragment(labware: Labware): LabwareFieldsFragment {
  return {
    __typename: "Labware",
    id: labware.id,
    barcode: labware.barcode,
    destroyed: labware.destroyed,
    discarded: labware.discarded,
    released: labware.released,
    labwareType: {
      __typename: "LabwareType",
      name: labware.labwareType.name,
      numRows: labware.labwareType.numRows,
      numColumns: labware.labwareType.numColumns,
      labelType: labware.labwareType.labelType,
    },
    slots: labware.slots.map((slot) => ({
      __typename: "Slot",
      address: slot.address,
      labwareId: slot.labwareId,
      samples: slot.samples.map((sample) => ({
        id: sample.id,
        bioState: {
          __typename: "BioState",
          name: sample.bioState.name,
        },
        tissue: {
          donor: {
            donorName: sample.tissue.donor.donorName,
            __typename: "Donor",
          },
          externalName: sample.tissue.externalName,
          spatialLocation: {
            tissueType: {
              name: sample.tissue.spatialLocation.tissueType.name,
              __typename: "TissueType",
            },
            code: sample.tissue.spatialLocation.code,
            __typename: "SpatialLocation",
          },
          replicate: sample.tissue.replicate,
          __typename: "Tissue",
        },
        __typename: "Sample",
      })),
    })),
  };
}
