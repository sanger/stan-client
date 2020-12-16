import { Labware } from "../../types/graphql";
import { find, isEqual } from "lodash";
import {
  AnyLabware,
  Address,
  isColumnAddress,
  isRowAddress,
  LabwareAddress,
} from "../../types/stan";
import { cycle } from "../helpers";

/**
 * Returns an array of {@link LabwareAddress LabwareAddress}s for a labware (in column-major order)
 * @param labware
 */
export function labwareAddresses(labware: AnyLabware): Array<LabwareAddress> {
  const addresses: Array<LabwareAddress> = [];
  for (let i = 1, j = labware.labwareType.numColumns; i <= j; i++) {
    for (let m = 1, n = labware.labwareType.numRows; m <= n; m++) {
      const friendlyAddress = createAddress(m, i);
      addresses.push({
        address: friendlyAddress,
        slot:
          find(labware.slots, (slot) =>
            isEqual(slot.address, friendlyAddress)
          ) ?? null,
      });
    }
  }
  return addresses;
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
export function createAddress(
  rowNumber: number,
  columnNumber: number
): Address {
  const aCharCode = "A".charCodeAt(0);

  const row = String.fromCharCode(rowNumber + aCharCode - 1);
  const col = String(columnNumber);

  if (!isRowAddress(row)) {
    throw new Error(`${rowNumber} can not be converted to FriendlyRowAddress`);
  }
  if (!isColumnAddress(col)) {
    throw new Error(
      `${columnNumber} can not be converted to FriendlyColumnAddress`
    );
  }
  return `${row}${col}` as Address;
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
    "#EF4444",
    "#10B981",
    "#6366F1",
    "#EC4899",
    "#F59E0B",
    "#3B82F6",
    "#8b5cf6",
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
