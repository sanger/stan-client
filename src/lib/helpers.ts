import * as queryString from "query-string";
import { ParsedQuery } from "query-string";
import { GridDirection, Maybe } from "../types/graphql";
import { SizeInput } from "../types/stan";
import _ from "lodash";

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
  const parsed = parseQueryString(query, {
    arrayFormat: "bracket",
    parseNumbers: false,
    parseBooleans: true,
  });
  return guard(parsed) ? parsed : null;
}

/**
 * Parse a query string into an object
 * @param query the query string
 */
export const parseQueryString = queryString.parse;

/**
 * Stringify an object to be used as a query string
 * @param obj the object to stringify
 */
export function stringify(obj: object): string {
  return queryString.stringify(obj, { skipEmptyString: true });
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

/**
 * Loop through URL params, filtering out unwanted keys,
 * removing nil (null or undefined), empty values, and values that are arrays
 *
 * @param params the URL params
 * @param allowedKeys
 */
export function cleanParams(params: ParsedQuery, allowedKeys: any[]) {
  return _(params)
    .pick(allowedKeys)
    .omitBy(_.isNil)
    .omitBy(_.isEmpty)
    .omitBy(_.isArray)
    .value();
}

/**
 * Create a generator for cycling through a list of colors
 */
export function cycleColors() {
  return cycle(["red", "green", "indigo", "pink", "blue", "purple"]);
}
