import { Labware, LabwareType } from "../../types/graphql";
import { cycle } from "../helpers";
import { orderBy } from "lodash";

/**
 * Generator for labware addresses
 * @param labwareType
 */
export function* labwareAddresses(
  labwareType: Pick<LabwareType, "numColumns" | "numRows">
) {
  for (let i = 1, j = labwareType.numColumns; i <= j; i++) {
    for (let m = 1, n = labwareType.numRows; m <= n; m++) {
      yield createAddress(m, i);
    }
  }
}

/**
 * Converts an {@link Address} into its user-friendly version
 *
 * @example
 * createAddress(3, 5) // "C5"
 *
 * @param rowNumber the 1-based index of the row
 * @param columnNumber the 1-based index of the column
 */
export function createAddress(rowNumber: number, columnNumber: number): string {
  if (rowNumber < 1 || rowNumber > 8) {
    throw new Error(`${rowNumber} can not be used as a row index`);
  }
  if (columnNumber < 1 || columnNumber > 12) {
    throw new Error(`${columnNumber} can not be used as a column index`);
  }

  const aCharCode = "A".charCodeAt(0);
  const row = String.fromCharCode(rowNumber + aCharCode - 1);

  return `${row}${columnNumber}`;
}

/**
 * Build an array of all {@link Sample samples} in a {@link Labware} along with its {@link Slot} plus the original {@link Labware}
 * @param labware a {@link Labware}
 */
export function labwareSamples(labware: Labware) {
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
export function buildSampleColors(labwares: Labware[]): Map<number, string> {
  const colors = cycle([
    "red",
    "green",
    "indigo",
    "pink",
    "yellow",
    "blue",
    "purple",
  ]);
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

interface HasAddress {
  address: string;
}

export function rowMajor<T extends HasAddress>(slots: Array<T>): Array<T> {
  return orderBy(
    slots,
    [
      (slot) => getRowIndex(slot.address),
      (slot) => getColumnIndex(slot.address),
    ],
    ["asc", "asc"]
  );
}
