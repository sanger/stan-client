import {
  GetPrintersQuery,
  LabelType,
  Labware,
  LabwareFieldsFragment,
  Maybe,
  PlanRequestAction,
  Size,
} from "./graphql";
import {ApolloError} from "@apollo/client";

/**
 * Union of STAN's {@link OperationType} names
 */
export type OperationTypeName = "Section" | "Visium cDNA";

/**
 * Enum for all of STAN's {@link LabwareType} names
 */
export enum LabwareTypeName {
  PROVIASETTE = "Proviasette",
  TUBE = "Tube",
  VISIUM_LP = "Visium LP",
  VISIUM_TO = "Visium TO",
  SLIDE = "Slide",
  PLATE = "96 well plate",
}

export type Address = string;

export type SizeInput = Omit<Size, "__typename">;

/**
 * A {@link PlanRequestAction} before it knows where it's going
 */
export type SourcePlanRequestAction = Omit<PlanRequestAction, "address">;

/**
 * Type for when a piece of labware has been created in the client, but has not
 * yet been persisted, and so will not have a barcode yet.
 */
export type NewLabwareLayout = Nullable<LabwareFieldsFragment, "barcode">;

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
    message: matchArray !== null ? matchArray[1] : null,
    problems: e.graphQLErrors.reduce<string[]>(
      (memo, graphQLError, _index, _original) => {
        if (!graphQLError.extensions?.hasOwnProperty("problems")) {
          return memo;
        }
        return [...memo, ...graphQLError.extensions["problems"]];
      },
      []
    ),
  };
}

/**
 * Construct a new type of {@code T} but with the keys {@code K} made nullable
 *
 * @param T the type
 * @param K the union of keys to make nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> &
  { [P in K]: T[P] | null };

/**
 * A piece of labware than can be printed i.e. has a label type
 */
export type PrintableLabware = Pick<Labware, "barcode"> & {
  labwareType: {
    labelType?: Maybe<Pick<LabelType, "name">>;
  };
};

export type PrintResultType = {
  successful: boolean;
  labelsPerBarcode: number;
  printer: GetPrintersQuery["printers"][number];
  labwares: Array<PrintableLabware>;
};

export type SearchResultsType = {
  numDisplayed: number;
  numRecords: number;
  entries: SearchResultTableEntry[];
};

/**
 * A single row on the results table of the Search page
 */
export type SearchResultTableEntry = {
  barcode: string;
  labwareType: string;
  externalId: string;
  donorId: string;
  tissueType: string;
  location: Maybe<SearchResultTableEntryLocation>;
  sectionNumber?: Maybe<number>;
  replicate: number;
};

export type SearchResultTableEntryLocation = {
  barcode: string;
  displayName: string;
  address?: Maybe<number>;
};

/**
 * Type for possible location URL params
 */
export type LocationSearchParams = {
  labwareBarcode: string;
};

/**
 * Custom type guard for {@link LocationSearchParams}
 */
export function isLocationSearch(obj: any): obj is LocationSearchParams {
  return "labwareBarcode" in obj && typeof obj["labwareBarcode"] === "string";
}

/**
 * Parameters expected in the react-router match object (i.e. URL parameters)
 */
export interface LocationMatchParams {
  locationBarcode: string;
}

/**
 * Type for when an XState service resolves without error
 * @param <T> the name of the service
 * @param <E> the data the service resolves with
 * @see {@link https://xstate.js.org/docs/guides/communication.html#invoking-services XState Services}
 */
export type MachineServiceDone<T extends string, E> = {
  type: `done.invoke.${T}`;
  data: E;
}

/**
 * Type for when an XState service errors
 * @param <T> the name of the service
 * @see {@link https://xstate.js.org/docs/guides/communication.html#invoking-services XState Services}
 */
export type MachineServiceError<T extends string> = {
  type: `error.platform.${T}`;
  data: ApolloError;
};

/**
 * An object with an `address` e.g. a Slot
 */
export interface Addressable {
  address: string;
  [key: string]: any;
}