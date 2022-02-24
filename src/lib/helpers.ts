import * as queryString from "query-string";
import * as Yup from "yup";
import { ParsedQuery } from "query-string";
import { GridDirection, Maybe } from "../types/sdk";
import { HasEnabled, SizeInput } from "../types/stan";
import _ from "lodash";
import { Key } from "react";
import { Column } from "react-table";

/**
 * Utility for retrieving a list of correctly typed object keys.
 * As TypeScript enums are really just objects, this can be used for them also.
 * @param o object to retrieve keys from
 */
export function objectKeys<E>(o: E): (keyof E)[] {
  return Object.keys(o) as (keyof E)[];
}

/**
 * Utility to get the key from value for  a string enum
 * @param enumObject enum to retrieve the key
 * @param enumVal value for which the key to be retrieved
 */
export function enumKey<E extends { [index: string]: string }>(
  enumObject: E,
  enumVal: string
): keyof E | undefined {
  return Object.keys(enumObject).find((key) => enumObject[key] === enumVal);
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

type GuardAndTransformParams<T> = {
  /**
   * A URL query string
   * @example "foo=bar&baz[]=fiz"
   */
  query: string;

  /**
   * A user-defined type guard to check the parsed URL query
   * @param s the parsed URL query
   */
  guard: (s: any) => s is T;

  /**
   * An optional function to transform parsed query string before it is given to the type guard
   * @param s the parsed URL query
   */
  transform?: (s: any) => any;
};
type SchemaParams = {
  /**
   * A URL query string
   */
  query: string;

  /**
   * A Yup schema. Used to cast and validate the parsed URL query string.
   */
  schema: Yup.Schema<any>;
};
type SafeParseQueryStringParams<T> = GuardAndTransformParams<T> | SchemaParams;

/**
 * Will attempt to deserialize a URL query string into a given type <T>
 * @return T if query can be parsed and conforms to the type guard or schema; null otherwise
 */
export function safeParseQueryString<T>(
  params: SafeParseQueryStringParams<T>
): Maybe<T> {
  let parsed = parseQueryString(params.query, {
    arrayFormat: "bracket",
    parseNumbers: false,
    parseBooleans: true,
  });

  if ("schema" in params) {
    try {
      const castValue = params.schema.cast(parsed);
      return params.schema.isValidSync(castValue) ? castValue : null;
    } catch {
      return null;
    }
  }

  const { transform, guard } = params;

  if (transform) {
    parsed = transform(parsed);
  }

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
  return queryString.stringify(obj, {
    skipEmptyString: true,
    arrayFormat: "bracket",
  });
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
 * Creates a list of addresses for a {@link SizeInput}
 * @param size an object with `numRows` and `numColumns` properties
 * @param direction the grid direction
 */
export function buildAddresses(
  size: SizeInput,
  direction: GridDirection = GridDirection.RightDown
): Array<string> {
  let directionSize =
    direction === GridDirection.RightDown ? size.numRows : size.numColumns;
  let orthogonalDirectionSize =
    direction === GridDirection.RightDown ? size.numColumns : size.numRows;

  const addresses = new Array<string>();

  for (let i = 1, j = directionSize; i <= j; i++) {
    for (let m = 1, n = orthogonalDirectionSize; m <= n; m++) {
      if (direction === GridDirection.RightDown) {
        addresses.push(createAddress(i, m));
      } else {
        addresses.push(createAddress(m, i));
      }
    }
  }

  return addresses;
}

/**
 * Loop through URL params, filtering out unwanted keys,
 * removing nil (null or undefined), empty values, and values that are arrays
 *
 * @param params the URL params
 * @param allowedKeys list of keys to pick from params
 */
export function cleanParams<T>(
  params: ParsedQuery<T>,
  allowedKeys: Array<string>
) {
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

/**
 * Get a timestamp as a string
 * @return timestamp in the format yyyyMMddHHmmss
 */
export function getTimestampStr(date?: Date): string {
  if (!date) {
    date = new Date();
  }
  return date
    .toISOString()
    .split(".")[0]
    .replace(/[^0-9]+/g, "");
}

/**
 * Predicate to check if an enablelable entity is currently enabled
 * @param enablelable an object with an {@code enabled} property
 * @return true if the entity is enabled; false otherwise
 */
export function isEnabled(enablelable: HasEnabled): boolean {
  return enablelable.enabled;
}

type Mapify<K extends string> = {
  [key in K]: Key;
};

/**
 * Convert a list to a map with one of the items properties used as the key
 * @param items the list of items to convert to a map
 * @param key the name of the property to use as the map's key
 */
export function mapify<K extends string, T extends Mapify<K>>(
  items: T[],
  key: K
): Map<Key, T> {
  return new Map<Key, T>(items.map((item) => [item[key], item] as const));
}

/**
 *
 */

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  enumType: T,
  enumValue: string
): keyof T | undefined {
  return Object.keys(enumType).find((x) => enumType[x] === enumValue);
}

export type StringKeyedProps = { [key: string | number]: any };

/**
 * Creates the content for an export file
 *
 * @param columns list of columns to build. Note that the columns must have their {@code Header}
 *        and {@code accessor} (as a string) set
 * @param entries the data to go into the file, or as a string array of values (assumes that it is in same order of columns)
 * @param delimiter (optional) the column delimiter
 */
export function createDownloadFileContent<T extends StringKeyedProps>(
  columns: Array<Column<T>>,
  entries: Array<T> | Array<Array<string>>,
  delimiter?: string
): string {
  if (!delimiter) {
    delimiter = "\t";
  }
  const columnNameRow = columns.map((column) => column.Header).join(delimiter);
  const rows = entries
    .map((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((val) => val).join(delimiter);
      } else {
        return columns
          .map((column) => {
            if (typeof column.accessor === "string") {
              const value = entry[column.accessor];
              if (
                typeof value === "object" &&
                (value as Object) instanceof Date
              ) {
                const date = value as Date;
                return date.toLocaleDateString();
              } else if (typeof value === "number") {
                return String(value);
              } else {
                return value;
              }
            }
            throw new Error(
              "createDownloadFileContent requires all column accessors to be strings"
            );
          })
          .join(delimiter);
      }
    })
    .join("\n");

  return `${columnNameRow}\n${rows}`;
}

/**
 * Creates the content for an export file
 *
 * @param columnNames list of column header names to build. Note that the columns must have their {@code Header}
 *        and {@code accessor} (as a string) set
 * @param columnAccessPath member field names in an object to access column values
 * @param entries the data to go into the file, or as a string array of values (assumes that it is in same order of columns)
 * @param delimiter (optional) the column delimiter
 */
export function createDownloadFileContentFromObjectKeys<
  T extends StringKeyedProps
>(
  columnNames: Array<string>,
  columnAccessPath: Array<Array<string>>,
  entries: Array<T> | Array<Array<string>>,
  delimiter?: string
): string {
  if (!delimiter) {
    delimiter = "\t";
  }
  const columnNameRow = columnNames.join(delimiter);
  const rows = entries
    .map((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((val) => val).join(delimiter);
      } else {
        return columnAccessPath
          .map((columnPath) => {
            const value = getPropertyValue(entry, columnPath);
            return String(value);
          })
          .join(delimiter);
      }
    })
    .join("\n");
  return `${columnNameRow}\n${rows}`;
}

export type SortDirection = "ascending" | "descending";
/**
 * Function to sort alphaNumeric values based on reg expressions given. Thisvsorts
 * @param a
 * @param b
 * @param regExp  Reg expressions for string and numeric parts.
 * @param alphaFirst Flag to sort first on alpha and then numeric or viceversa.
 */
export function regexSort(
  a: string,
  b: string,
  regExp: { alpha: RegExp; numeric: RegExp },
  alphaFirst: boolean = true
): number {
  let aPrim: string | number;
  let aSec: string | number;
  let bPrim: string | number;
  let bSec: string | number;

  let aAlpha = (aPrim = a.replace(regExp.alpha, ""));
  const bAlpha = (bPrim = b.replace(regExp.alpha, ""));
  const aNumericVal = a.replace(regExp.numeric, "");
  const bNumericVal = b.replace(regExp.numeric, "");
  const aNumeric = (aSec =
    aNumericVal !== "" ? parseInt(aNumericVal, 10) : Number.MAX_VALUE);
  const bNumeric = (bSec =
    bNumericVal !== "" ? parseInt(bNumericVal, 10) : Number.MAX_VALUE);
  if (!alphaFirst) {
    aPrim = aNumeric;
    bPrim = bNumeric;
    aSec = aAlpha;
    bSec = bAlpha;
  }

  if (aPrim === bPrim) {
    return aSec === bSec ? 0 : aSec > bSec ? 1 : -1;
  } else {
    return aPrim > bPrim ? 1 : -1;
  }
}

/**Get value for a property field from an object using the given path
 * @param obj Object to search for
 * @param propertyPath Property names to traverse the object to reach the required search property field
 * @example  To get 'name' field value in a 'work' object - 'work'  holds a property 'workType' which is an object with 'name' field
 *            the path should be ["workType","name"]
 ***/
export const getPropertyValue = (
  obj: StringKeyedProps,
  propertyPath: string[]
): number | string => {
  let propValue: any = obj;
  for (let indx = 0; indx < propertyPath.length; indx++) {
    const val = propValue[propertyPath[indx]];
    if (!val) {
      return "";
    }
    propValue = val;
  }
  if (propValue instanceof Date) {
    propValue = propValue.getTime();
  }
  if (typeof propValue !== "string" && typeof propValue !== "number") return "";
  return propValue;
};
