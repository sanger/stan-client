import { Address, SizeInput } from "../../types/stan";
import { GridDirection, Maybe } from "../../types/sdk";
import { chain, range, zip } from "lodash";
import { buildAddresses } from "../helpers";
import { StoredItemFragment } from "../machines/locations/locationMachineTypes";

/**
 * Convert a StoreLight address into a STAN address
 * @param address the StoreLight address
 * @param locationSize the size of the location
 * @param direction the grid direction of the location
 */
export function addressToLocationAddress(
  address: Address,
  locationSize: SizeInput,
  direction: GridDirection
): number {
  const orderedAddresses = buildOrderedAddresses(locationSize, direction);
  if (!orderedAddresses.has(address)) {
    throw Error(`Address ${address} is out of bounds`);
  }
  return orderedAddresses.get(address)!;
}

/**
 * Builds an ordered map of Storelight address to Stan address
 *
 * The order of the returned addresses are RightDown (i.e. the order they will be rendered in)
 *
 * @example
 * buildOrderedAddresses({ numRows: 2, numColumns: 2}, GridDirection.RightDown);
 * // Result
 * // {
 * //   A1: 1,
 * //   A2: 2,
 * //   B1: 3,
 * //   B2: 4,
 * // }
 *
 * @param size the size of the location
 * @param direction the grid direction of the location
 */
export function buildOrderedAddresses(
  size: SizeInput,
  direction: GridDirection
): Map<string, number> {
  const numberOfAddresses = size.numRows * size.numColumns;
  const stanAddresses = chain(range(1, numberOfAddresses + 1));

  /**
   * The zip return type is Array<E | undefined>[], as each chunk may not be
   * the same size. As we know they will be, we'll cast it to a list of list of E
   */
  const zipList = function <E>(list: Array<E>[]): Array<E>[] {
    return zip(...list) as Array<E>[];
  };

  let sortedAddresses: Array<number>;

  switch (direction) {
    case GridDirection.RightUp:
      sortedAddresses = stanAddresses
        .chunk(size.numColumns)
        .reverse()
        .flatten()
        .value();
      break;
    case GridDirection.UpRight:
      sortedAddresses = stanAddresses
        .chunk(size.numRows)
        .thru(zipList)
        .reverse()
        .flatten()
        .value();
      break;
    case GridDirection.RightDown:
      sortedAddresses = stanAddresses.value();
      break;
    case GridDirection.DownRight:
      sortedAddresses = stanAddresses
        .chunk(size.numRows)
        .thru(zipList)
        .flatten()
        .value();
  }

  const storelightAddresses = buildAddresses(size);
  const addressMap: Map<string, number> = new Map();

  storelightAddresses.forEach((address, index) => {
    addressMap.set(address, sortedAddresses[index]);
  });

  return addressMap;
}

interface NextAvailableAddressParams {
  /**
   * A map of Storelight address to Stan address
   */
  locationAddresses: Map<string, number>;

  /**
   * A map of Storelight address to a stored item
   */
  addressToItemMap: Map<string, StoredItemFragment>;

  /**
   * Next available address must be higher than the minimum address
   */
  minimumAddress?: Maybe<string>;

  /**
   * Number of addresses to find-  If not given, only the first available address will be returned.
   *
   */
  numAddresses?: number;
}

/**
 * Finds the next available (i.e. unoccupied) address in a location,
 * taking into account the grid direction
 * If numAddresses is given and there are not enough consecutive free addresses in the location as required by this parameter,
 * an array with available consecutive addresses is returned
 */
export function findNextAvailableAddress({
  locationAddresses,
  addressToItemMap,
  minimumAddress = null,
  numAddresses,
}: NextAvailableAddressParams): string[] {
  // Build a list of [storelightAddress, stanAddress] tuples, ordered by Stan address
  let addressEntries = Array.from(locationAddresses.entries()).sort(
    (a, b) => a[1] - b[1]
  );

  // Filter out any addresses below the specified minimum (if not null))
  if (minimumAddress) {
    const currentIndex = addressEntries.findIndex(
      (entry) => entry[0] === minimumAddress
    );
    addressEntries = addressEntries.filter(
      (entry, index) => index >= currentIndex
    );
  }
  /**
   Go through the ordered addresses checking if there's an item in each one.
   If there are not enough consecutive addresses found as required, return the ones until a non-empty address
   **/
  const retAddressArr: string[] = [];
  if (numAddresses && numAddresses > 0) {
    addressEntries.forEach((entry) => {
      //got addresses as required
      if (retAddressArr.length >= numAddresses) return retAddressArr;
      //if the address is empty,add that address
      if (addressToItemMap.get(entry[0]) === undefined) {
        retAddressArr.push(entry[0]);
      } else return retAddressArr;
    });
  } else {
    const address =
      addressEntries.find((entry) => !addressToItemMap.get(entry[0]))?.[0] ??
      null;
    if (address) {
      retAddressArr.push(address);
    }
  }
  return retAddressArr;
}
