import { Address, SizeInput } from "../../types/stan";
import { GridDirection } from "../../types/sdk";

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
  let row = 0,
    column = 0;
  if (address.includes(",")) {
    const [rowStr, columnStr] = address.split(",");
    row = parseInt(rowStr);
    column = parseInt(columnStr);
  } else {
    row = address.charCodeAt(0) - "A".charCodeAt(0) + 1;
    column = parseInt(address.substr(1));
  }
  const locationAddress =
    direction === GridDirection.RightDown
      ? (row - 1) * locationSize.numColumns + column
      : (column - 1) * locationSize.numRows + row;

  return locationAddress;
}
