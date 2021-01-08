import { Address, SizeInput } from "../../types/stan";
import { GridDirection } from "../../types/graphql";

export function addressToLocationAddress(
  address: Address,
  locationSize: SizeInput,
  direction: GridDirection
): string {
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

  return String(locationAddress);
}
