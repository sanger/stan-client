import { Address, AddressInput, Labware } from "../../types/graphql";
import { find, isEqual } from "lodash";
import {
  AnyLabware,
  FriendlyAddress,
  isFriendlyColumnAddress,
  isFriendlyRowAddress,
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
      let address = createAddress(m, i);
      addresses.push({
        address,
        addressInput: createAddressInput(m, i),
        friendlyAddress: createFriendlyAddress(address),
        slot:
          find(labware.slots, (slot) => isEqual(slot.address, address)) ?? null,
      });
    }
  }
  return addresses;
}

/**
 * Create an {@link Address}
 * @param row row number
 * @param column column number
 */
function createAddress(row: number, column: number): Address {
  validateAddressInput(row, column);
  return { row, column, __typename: "Address" };
}

/**
 * Creates an {@link Address}
 * Same as {@link Address} but without the `__typename` property. Used as a GraphQL input.
 *
 * @param row row number
 * @param column column number
 */
function createAddressInput(row: number, column: number): AddressInput {
  validateAddressInput(row, column);
  return { row, column };
}

/**
 * Validate that an Address is within range
 * @param row Labware row
 * @param column Labware column
 */
function validateAddressInput(row: number, column: number): void {
  if (row < 1 || row > 8) {
    throw new Error("Row is out of range");
  }
  if (column < 1 || row > 12) {
    throw new Error("Column is out of range");
  }
}

/**
 * Converts an {@link Address} into its user-friendly version
 * @param address an Address on a piece of Labware
 *
 * @example
 * createFriendlyAddress({ row: 3, column: 5 }) // "C5"
 */
export function createFriendlyAddress(address: Address): FriendlyAddress {
  const aCharCode = "A".charCodeAt(0);

  const row = String.fromCharCode(address.row + aCharCode - 1);
  const col = String(address.column);

  if (!isFriendlyRowAddress(row)) {
    throw new Error(
      `${address.row} can not be converted to FriendlyRowAddress`
    );
  }
  if (!isFriendlyColumnAddress(col)) {
    throw new Error(
      `${address.column} can not be converted to FriendlyColumnAddress`
    );
  }
  return `${row}${col}` as FriendlyAddress;
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
