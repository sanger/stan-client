import { LabwareLayoutFragment } from "../../types/graphql";
import { cycleColors } from "../helpers";
import { orderBy } from "lodash";

/**
 * Build an array of all {@link Sample samples} in a {@link Labware} along with its {@link Slot} plus the original {@link Labware}
 * @param labware a {@link Labware}
 */
export function labwareSamples(labware: LabwareLayoutFragment) {
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
  labwares: LabwareLayoutFragment[]
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

function getRowIndex(address: string): number {
  return address.charCodeAt(0) - "A".charCodeAt(0) + 1;
}

function getColumnIndex(address: string): number {
  return parseInt(address.substr(1));
}

export interface Addressable {
  address: string;
}

export function rowMajor<T extends Addressable>(
  addressable: Array<T>
): Array<T> {
  return orderBy(
    addressable,
    [(a) => getRowIndex(a.address), (a) => getColumnIndex(a.address)],
    ["asc", "asc"]
  );
}

export function columnMajor<T extends Addressable>(
  addressable: Array<T>
): Array<T> {
  return orderBy(
    addressable,
    [(a) => getColumnIndex(a.address), (a) => getRowIndex(a.address)],
    ["asc", "asc"]
  );
}
