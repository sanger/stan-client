import * as Yup from 'yup';
import { Maybe } from '../types/sdk';
import { HasEnabled, SizeInput } from '../types/stan';
import { isNaN } from 'lodash';
import { Key } from 'react';
import { Column } from 'react-table';

/**
 * Utility for retrieving a list of correctly typed object keys.
 * As TypeScript enums are really just objects, this can be used for them also.
 * @param o object to retrieve keys from
 */
export function objectKeys<E extends Record<string, any>>(o: E): (keyof E)[] {
  return Object.keys(o) as (keyof E)[];
}

/**
 * Utility to get the key from value for  a string enum
 * @param enumObject enum to retrieve the key
 * @param enumVal value for which the key to be retrieved
 */
export function enumKey<E extends { [index: string]: string }>(enumObject: E, enumVal: string): keyof E | undefined {
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
  schema: Yup.AnyObjectSchema;
};
type SafeParseQueryStringParams<T> = GuardAndTransformParams<T> | SchemaParams;

export enum GridDirection {
  /** Right across the top row, then down to the next row, etc. */
  RightDown = 'RightDown',
  /** Down the leftmost column, then right to the next column, etc. */
  DownRight = 'DownRight',
  /** Right across the bottom row, then up to the next row, etc. */
  RightUp = 'RightUp',
  /** Up the leftmost column, then right to the next column, etc. */
  UpRight = 'UpRight',
  /** Left across the bottom row, then up to the next row, etc. */
  LeftUp = 'LeftUp'
}

export enum LabwareDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical'
}

export enum Position {
  TopRight = 'TopRight',
  BottomRight = 'BottomRight',
  TopLeft = 'TopLeft',
  BottomLeft = 'BottomLeft',
  Right = 'Right',
  Left = 'Left'
}

/**
 * Will attempt to deserialize a URL query string into a given type <T>
 * @return object if query can be parsed and conforms to the type guard or schema; null otherwise
 */
export function safeParseQueryString<T>(params: SafeParseQueryStringParams<T>): Maybe<T> {
  let parsed = parseQueryString(params.query);
  if ('schema' in params) {
    try {
      const castValue = params.schema.cast(parsed);
      return params.schema.isValidSync(castValue) ? (castValue as unknown as T) ?? null : null;
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
 * This is an alternative for query-string parse method
 * Parse a query string into an object
 * @param query the query string
 */
type ParsedQuery = Record<string, string | string[]>;
export function parseQueryString(queryString: string): ParsedQuery {
  const params = new URLSearchParams(queryString);
  const parsedQuery: ParsedQuery = {};
  for (const [key, value] of params.entries()) {
    const normalizedKey = key.replace('[]', '');
    const currentValue = parsedQuery[normalizedKey];
    if (Array.isArray(currentValue)) {
      parsedQuery[normalizedKey] = [...currentValue, value];
    } else if (currentValue !== undefined) {
      parsedQuery[normalizedKey] = [currentValue, value];
    } else {
      parsedQuery[normalizedKey] = key.includes('[]') ? [value] : value;
    }
  }

  return parsedQuery;
}

/**
 * @returns A function that takes a key and returns a function that encodes the key-value pair.
 */
function encoderForArrayFormat() {
  return (key: string) => (result: string, value: string) => {
    if (value === undefined) {
      return result;
    }
    if (value === null) {
      return [...result, [encodeURIComponent(key), '[]'].join('')];
    }
    return [...result, [encodeURIComponent(key), '[]=', encodeURIComponent(value)].join('')];
  };
}

/**
 * This is an alternative for query-string stringify method
 * Stringify an object to be used as a query string
 * @param obj the object to stringify
 */
export function stringify(obj: Record<string, any>): string {
  const formatter = encoderForArrayFormat();
  const keys = Object.keys(obj);
  return keys
    .filter((key) => obj[key] !== undefined && obj[key] !== null && obj[key].length > 0)
    .map((key) => {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value.reduce(formatter(key), []).join('&');
      }
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .filter((x) => x.length > 0)
    .join('&');
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
  const aCharCode = 'A'.charCodeAt(0);
  const row = String.fromCharCode(rowNumber + aCharCode - 1);
  return `${row}${columnNumber}`;
}

/**
 * Creates a list of addresses for a {@link SizeInput}
 * @param size an object with `numRows` and `numColumns` properties
 * @param direction the grid direction
 */
export function buildAddresses(size: SizeInput, direction: GridDirection = GridDirection.RightDown): Array<string> {
  const { numRows, numColumns } = size;
  const addresses = new Array<string>();

  switch (direction) {
    case GridDirection.RightDown:
      // Right across the top row, then down to the next row, etc. //standard row-major order
      for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numColumns; col++) {
          addresses.push(createAddress(row, col));
        }
      }
      break;

    case GridDirection.DownRight:
      // Down the leftmost column, then right to the next column, etc.
      for (let col = 1; col <= numColumns; col++) {
        for (let row = 1; row <= numRows; row++) {
          addresses.push(createAddress(row, col));
        }
      }
      break;

    case GridDirection.RightUp:
      // Right across the bottom row, then up to the next row, etc. // A1, ..An row is at the bottom
      for (let row = numRows; row >= 1; row--) {
        for (let col = 1; col <= numColumns; col++) {
          addresses.push(createAddress(row, col));
        }
      }
      break;

    case GridDirection.LeftUp:
      // Reverse row-major order (bottom to top, right to left) // Rotate 180 degrees
      for (let row = numRows; row >= 1; row--) {
        for (let col = numColumns; col >= 1; col--) {
          addresses.push(createAddress(row, col));
        }
      }
      break;

    default:
      throw new Error(`Unsupported direction: ${direction}`);
  }

  return addresses;
}

/**
 * Create a generator for cycling through a list of colors
 */
const COLORS = ['red', 'green', 'indigo', 'pink', 'blue', 'purple'];

export function backgroundColorClassNames() {
  return cycle(COLORS.map((color) => `bg-${color}-500`));
}

export function disabledBackgroundColorClassNames() {
  return cycle(COLORS.map((color) => `bg-${color}-200`));
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
    .split('.')[0]
    .replace(/[^0-9]+/g, '');
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
export function mapify<K extends string, T extends Mapify<K>>(items: T[], key: K): Map<Key, T> {
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
 */
export function createDownloadFileContent<T extends StringKeyedProps>(
  columns: Array<Column<T>>,
  entries: Array<T> | Array<Array<string>>
): Array<Array<string>> {
  const columnNamesRow = columns.map((column) => String(column.Header));
  const rows = entries.map((entry) => {
    if (Array.isArray(entry)) {
      return entry;
    } else {
      return columns.map((column) => {
        if (typeof column.accessor === 'string') {
          const value = entry[column.accessor];
          if (Array.isArray(value)) {
            return value.join(',');
          }

          if (typeof value === 'object' && (value as Object) instanceof Date) {
            const date = value as Date;
            return date.toLocaleDateString();
          }
          if (typeof value === 'number') {
            return String(value);
          }
          return value;
        }
        if (typeof column.accessor === 'function') {
          return column.accessor(entry, 0, { subRows: entries as T[], data: entries as T[], depth: 0 });
        }
        throw new Error('createDownloadFileContent requires all column accessors to be strings or functions');
      });
    }
  });
  rows.splice(0, 0, columnNamesRow);
  return rows;
}

/**
 * Creates the content for an export file
 *
 * @param columnNames list of column header names to build. Note that the columns must have their {@code Header}
 *        and {@code accessor} (as a string) set
 * @param columnAccessPath member field names in an object to access column values
 * @param entries the data to go into the file, or as a string array of values (assumes that it is in same order of columns)
 */
export function createDownloadFileContentFromObjectKeys<T extends StringKeyedProps>(
  columnNames: Array<string>,
  columnAccessPath: Array<Array<string>>,
  entries: Array<T> | Array<Array<string>>
): Array<Array<string>> {
  const rows = entries.map((entry) => {
    if (Array.isArray(entry)) {
      return entry;
    } else {
      return columnAccessPath.map((columnPath) => {
        const value = getPropertyValue(entry, columnPath);
        return String(value);
      });
    }
  });
  rows.splice(0, 0, columnNames);
  return rows;
}

export type SortDirection = 'ascending' | 'descending';
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

  let aAlpha = (aPrim = a.replace(regExp.alpha, ''));
  const bAlpha = (bPrim = b.replace(regExp.alpha, ''));
  const aNumericVal = a.replace(regExp.numeric, '');
  const bNumericVal = b.replace(regExp.numeric, '');
  const aNumeric = (aSec = aNumericVal !== '' ? parseInt(aNumericVal, 10) : Number.MAX_VALUE);
  const bNumeric = (bSec = bNumericVal !== '' ? parseInt(bNumericVal, 10) : Number.MAX_VALUE);
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
export const getPropertyValue = (obj: StringKeyedProps, propertyPath: string[]): number | string => {
  let propValue: any = obj;
  for (let indx = 0; indx < propertyPath.length; indx++) {
    const val = propValue[propertyPath[indx]];
    if (!val) {
      return '';
    }
    propValue = val;
  }
  if (propValue instanceof Date) {
    propValue = propValue.getTime();
  }
  if (typeof propValue !== 'string' && typeof propValue !== 'number') return '';
  return propValue;
};

/***Get number of days between two dates given (in string format)
 *
 * @param firstDate
 * @param secondDate
 */
export function getNumberOfDaysBetween(firstDate: string, secondDate: string) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const date1 = Date.parse(firstDate);
  const date2 = Date.parse(secondDate);
  if (isNaN(date1) || isNaN(date2)) {
    return undefined;
  } else {
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }
}
/**This type allows to create a new type from given type with specified fields as optional **/
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**Generate a random integer number between min and max**/
export function generateRandomIntegerInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Checks whether the given arrays have got same elements
 * @param array1
 * @param array2
 */
export function isSameArray(array1: string[], array2: string[]) {
  return array1.length === array2.length && array1.every((element) => array2.includes(element));
}

/**
 * Returns a comma separated string with unique values from the given array
 * @param array
 */
export function friendlyName(array: string[]) {
  return Array.from(new Set(array))
    .filter((str) => str.length > 0)
    .join(', ');
}
