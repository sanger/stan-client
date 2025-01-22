import {
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareState,
  Maybe,
  PrinterFieldsFragment,
  Size,
  WorkStatus
} from './sdk';
import { Location } from 'history';
import { ClientError } from 'graphql-request';
import { regexSort } from '../lib/helpers';
import { FunctionComponent } from 'react';
import { GraphQLError } from 'graphql/error';

/**
 * Union of STAN's {@link OperationType} names
 */
export type OperationTypeName = "Section" | "Transfer" | "Dual index plate" |"CytAssist";

/**
 * Enum for all of STAN's {@link LabwareType} names
 */
export enum LabwareTypeName {
  PROVIASETTE = "Proviasette",
  TUBE = "Tube",
  VISIUM_LP = "Visium LP",
  VISIUM_TO = "Visium TO",
  SLIDE = "6 slot slide",
  PLATE = "96 well plate",
  CASSETTE = "Cassette",
  VISIUM_ADH = "Visium ADH",
  FOUR_SLOT_SLIDE = "4 slot slide",
  FETAL_WASTE_CONTAINER = "Fetal waste container",
  DUAL_INDEX_PLATE = "Dual index plate",
  POT = "Pot",
  PRE_BARCODED_TUBE = "Prebarcoded tube",
  VISIUM_LP_CYTASSIST= "Visium LP CytAssist 6.5",
  VISIUM_LP_CYTASSIST_XL= "Visium LP CytAssist 11",
  VISIUM_LP_CYTASSIST_HD= "Visium LP CytAssist HD",
  XENIUM = "Xenium",
  STRIP_TUBE = "8 Strip Tube"

}

export type Address = string;

export type SizeInput = Omit<Size, "__typename">;

type ChildrenProps = {
  children: React.ReactNode;
}
export type FCWithChildren<P = {} & ChildrenProps> = FunctionComponent<P>;

/**
 * Type for when a piece of labware has been created in the client, but has not
 * yet been persisted, and so will not have a barcode yet.
 */
export type NewLabwareLayout = Nullable<LabwareFieldsFragment, "barcode">;
export type NewFlaggedLabwareLayout = Nullable<LabwareFlaggedFieldsFragment, "barcode">;

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

interface GraphQLErrorWithExtensions extends GraphQLError {
  extensions: {
    problems: Array<string>;
  };
  message: string;
  locations: {
    line: number;
    column: number;
  }[];
  path: string[];
}

/**
 * Builds a {@link ServerErrors} object from a ClientError
 * @param e ClientError
 */
export function   extractServerErrors(e: ClientError): ServerErrors {
  return {
    message:
      e.response.errors
        ?.map((error) => {
          const matchedMessage = error?.message?.match(/^.*\s:\s(.*)$/)?.[1];
          return matchedMessage || error?.message;
        })
        .filter(Boolean)
        .join('\n') ?? null,
    problems:
      (e.response.errors as GraphQLErrorWithExtensions[]).reduce<string[]>(
        (memo, graphQLError, _index, _original) => {
          if (!graphQLError.extensions?.hasOwnProperty("problems")) {
            return memo;
          }
          return [...memo, ...graphQLError.extensions["problems"]];
        },
        []
      ) ?? [],
  };
}

/**
 * Construct a new type of {@code T} but with the keys {@code K} made nullable
 *
 * @param T the type
 * @param K the union of keys to make nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

export type PrintResultType = {
  successful: boolean;
  labelsPerBarcode: number;
  printer: PrinterFieldsFragment;
  labwares: Array<LabwareFieldsFragment>;
};

export type SearchResultsType<T> = {
  numDisplayed?: number;
  numRecords?: number;
  entries: T[];
};

/**
 * A single row on the results table of the Search page
 */
export type SearchResultTableEntry = {
  barcode: string;
  labwareType: string;
  workNumbers: Array<Maybe<string>>;
  externalId?: Maybe<string>;
  donorId: string;
  tissueType: string;
  location: Maybe<SearchResultTableEntryLocation>;
  sectionNumber?: Maybe<number>;
  replicate?: Maybe<string>;
  labwareCreated: Date;
  embeddingMedium: string;
  fixative: string;
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
};

/**
 * Type for when an XState service errors
 * @param <T> the name of the service
 * @see {@link https://xstate.js.org/docs/guides/communication.html#invoking-services XState Services}
 */
export type MachineServiceError<T extends string, E = ClientError> = {
  type: `error.platform.${T}`;
  data: E;
};

/**
 * An object with an `address` e.g. a Slot
 */
export interface Addressable {
  address: string;
  [key: string]: any;
}

/**
 * Properties that can be added on to the URL state. Frequently used with react-router's Redirect component.
 */
export type LocationState = {
  referrer?: Location;
  success?: string;
  warning?: string;
  loggedOut?: boolean;
};

/**
 * An entity that can be disabled/enabled
 */
export type HasEnabled = { enabled: boolean };

/**
 * Properties that go in the config.js file
 */
export type StanConfig = {
  /**
   * The name of the current environment
   */
  env: string;

  /**
   * Tailwind color classes that will be applied to the header
   */
  headerColor: string;

  /**
   * Tailwind color classes that will be applied to the footer
   */
  footerColor: string;

  /**
   * URL for users to get support
   */
  supportUrl: string;

  /**
   * When was this release deployed
   */
  deploymentDate: string;

  /**
   * The maximum number of rows to display on the Search page
   */
  maxSearchRecords: number;
};

/**
 * Describes the columns of the History component table
 */
export type HistoryTableEntry = {
  eventId: number;
  date: string;
  sourceBarcode: string;
  destinationBarcode: string;
  labwareType:string;
  donorName?: string;
  sampleID?: Maybe<number>;
  externalName?: string;
  sectionNumber?: number;
  eventType: string;
  biologicalState?: string;
  labwareState: LabwareState;
  username: string;
  workNumber?: Maybe<string>;
  details: Array<string>;
  address?: string;
  sectionPosition?:string
};

export type HistoryData = {
  entries: Array<HistoryTableEntry>;
  flaggedBarcodes: Array<string>;
}

/**
 * Sort functionality for Status. The status need to be sorted in the order "active", "completed", "paused", "failed"
 * @param rowAStatus
 * @param rowBStatus
 */
export const statusSort = (rowAStatus: WorkStatus, rowBStatus: WorkStatus) => {
  const statusArray: WorkStatus[] = [
    WorkStatus.Active,
    WorkStatus.Paused,
    WorkStatus.Unstarted,
    WorkStatus.Completed,
    WorkStatus.Failed,
    WorkStatus.Withdrawn
  ];
  return (
    statusArray.findIndex((val) => val === rowAStatus) -
    statusArray.findIndex((val) => val === rowBStatus)
  );
};

/**
 * Sorts alphanumeric strings with alphabetical order  followed by number sort
 */
export const alphaNumericSortDefault = (a: string, b: string,alphaFirst: boolean = true): number => {
  const regAlpha = /[^a-zA-Z]*/g;
  const regNumeric = /[^0-9]*/g;
  return regexSort(a, b, { alpha: regAlpha, numeric: regNumeric },alphaFirst);
};


export function createSessionStorageForLabwareAwaiting( labware:LabwareFieldsFragment[]) {

  sessionStorage.setItem(
      'awaitingLabwares',
      labware
          .map(
              (lw: LabwareFieldsFragment) => {
                const sample =  lw.slots.find(slot => slot.samples.length > 0)?.samples.find(sample => sample.tissue !== undefined);
                return `${lw.barcode},${lw.labwareType.name},${sample?sample.tissue.externalName:""},${sample?sample.tissue.donor.donorName:""},${sample?sample.tissue.spatialLocation.tissueType.name:""},${sample?sample.tissue.spatialLocation.code:""},${sample?sample.tissue.replicate:""}`
              }
              )
          .join(',')
  );
}

// convert yyyy-mm-ddTHH:MM to yyyy-mm-dd HH:MM:00
export function formatDateTimeForCore(dateTime: Maybe<string>) {
  return dateTime ? dateTime.replace('T', ' ') + ':00' : "";
}

export function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/*declare module "yup" {
  interface ArraySchema<T> {
    unique(
        message: string,
        mapper?: (value: T, index?: number, list?: T[]) => T[]
    ): ArraySchema<T>;
  }
}
Yup.addMethod(Yup.array, "unique", function (
    message,
    mapper = (val: unknown) => val
) {
  return this.test(
      "unique",
      message,
      (list = []) => list.length === new Set(list.map(mapper)).size
  );
});*/

