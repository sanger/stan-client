import {Labware, Maybe, PlanRequestAction, Slot} from "./graphql";
import {ApolloError} from "@apollo/client";

/**
 * Union of STAN's {@link OperationType} names
 */
export type OperationTypeName = "Section";

/**
 * Enum for all of STAN's {@link LabwareType} names
 */
export enum LabwareTypeName {
  PROVIASETTE = "Proviasette",
  TUBE= "Tube",
  VISIUM_LP = "Visium LP",
  VISIUM_TO = "Visium TO",
  SLIDE = "Slide"
}

export type RowNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type ColumnNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type RowAddress = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type ColumnAddress = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";

/**
 * Template literal type for friendly labwareAddresses ("A1", "B1", etc.)
 * Builds a set of each combination of RowAddress and ColumnAddress
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types}
 */
export type Address = `${RowAddress}${ColumnAddress}`;

/**
 * Type guard for {@link RowAddress}
 *
 * @param row the letter of row
 */
export function isRowAddress(row: string): row is RowAddress {
  return row.length === 1 && row >= "A" && row <= "H";
}

/**
 * Type guard for a {@FriendlyRowColumn}
 * @param column the friendly column name
 */
export function isColumnAddress(column: string): column is ColumnAddress {
  const colNumber = Number(column);
  return colNumber > 0 && colNumber <= 12;
}

/**
 * A {@link PlanRequestAction} before it knows where it's going
 */
export type SourcePlanRequestAction = Omit<PlanRequestAction, "address">;

/**
 * Type for when a piece of labware has been created in the client, but has not
 * yet been persisted, and so will not have a barcode yet.
 */
export type UnregisteredLabware = Nullable<Labware, "id" | "barcode">;

/**
 * Labware that could be either be registered or unregistered (e.g. if it currently only exists in the client)
 */
export type AnyLabware = Labware | UnregisteredLabware;

/**
 * An {@link Address} with its {@link Slot}
 */
export interface LabwareAddress {
  address: Address;
  slot: Maybe<Slot>;
}

export interface ServerErrors {
  /**
   * The error message
   */
  message: Maybe<string>;

  /**
   * A list of problems that stopped the request from succeeding
   */
  problems: string[];
}

/**
 * Builds a {@link ServerErrors} object from an ApolloError
 * @param e ApolloError
 */
export function extractServerErrors(e: ApolloError): ServerErrors {
  const matchArray = e.message.match(/^.*\s:\s(.*)$/);

  return {
    message: (matchArray !== null) ? matchArray[1] : null,
    problems: e.graphQLErrors.reduce<string[]>(
      (memo, graphQLError, index, original) => {
        if (!graphQLError.extensions?.hasOwnProperty("problems")) {
          return memo;
        }
        return [...memo, ...graphQLError.extensions["problems"]];
      },
      []
    )
  }
}

/**
 * Construct a new type of {@code T} but with the keys {@code K} made nullable
 *
 * @param T the type
 * @param K the union of keys to make nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

