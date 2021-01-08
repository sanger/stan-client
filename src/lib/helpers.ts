import * as queryString from "query-string";
import { GridDirection, Maybe } from "../types/graphql";
import { SizeInput } from "../types/stan";

/**
 * Utility for retrieving a list of enum keys.
 * Useful for being able to iterate over enum values in a typesafe way.
 * @param e enum to retrieve keys from
 */

export function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}

/**
 * Generator for cycling through a list. Returns to the start once list is exhausted.
 * @param list list of anything
 */
export function* cycle(list: any[]) {
  let i = 0;
  const l = list.length;
  while (true) {
    yield list[i];
    i += 1;
    if (i === l) {
      i = 0;
    }
  }
}

/**
 * Safe parse URL params into given object
 *
 * @param <T> generic param for type to try and convert to
 * @param query the URL's query string
 * @param guard the user-defined type guard function
 */
export function safeParseQueryString<T>(
  query: string,
  guard: (s: any) => s is T
): Maybe<T> {
  const parsed = queryString.parse(query, {
    arrayFormat: "bracket",
    parseNumbers: false,
    parseBooleans: true,
  });

  return guard(parsed) ? parsed : null;
}

/**
 * Creates an Address from the given row and column numbers
 *
 * @example
 * createAddress(3, 5) // "C5"
 * createAddress(27, 10) // "27,10"
 *
 * @param rowNumber the 1-based index of the row
 * @param columnNumber the 1-based index of the column
 */
export function createAddress(rowNumber: number, columnNumber: number): string {
  if (rowNumber > 26) {
    return `${rowNumber},${columnNumber}`;
  }
  const aCharCode = "A".charCodeAt(0);
  const row = String.fromCharCode(rowNumber + aCharCode - 1);
  return `${row}${columnNumber}`;
}

/**
 * Generator for addresses from a {@link Size}
 * @param size something with `numRows` and `numColumns`
 * @param direction the grid direction
 */
export function* genAddresses(
  size: SizeInput,
  direction: GridDirection = GridDirection.RightDown
) {
  let directionSize =
    direction === GridDirection.RightDown ? size.numRows : size.numColumns;
  let orthogonalDirectionSize =
    direction === GridDirection.RightDown ? size.numColumns : size.numRows;

  for (let i = 1, j = directionSize; i <= j; i++) {
    for (let m = 1, n = orthogonalDirectionSize; m <= n; m++) {
      if (direction === GridDirection.RightDown) {
        yield createAddress(i, m);
      } else {
        yield createAddress(m, i);
      }
    }
  }
}
