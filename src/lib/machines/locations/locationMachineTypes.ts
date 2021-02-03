import { Interpreter, State, StateNode } from "xstate";
import { LocationFieldsFragment, Maybe } from "../../../types/graphql";
import { LocationSearchParams } from "../../../pages/Location";

/**
 * Context for a Location Machine
 */
export interface LocationContext {
  /**
   * The location retrieved from STAN core
   */
  location: LocationFieldsFragment;

  /**
   * The parsed URL parameters related to locations (if there are any)
   */
  locationSearchParams: Maybe<LocationSearchParams>;

  /**
   * The list of possible addresses for this location
   */
  locationAddresses: Array<string>;

  /**
   * A map of location address to stored item (or null if address is empty)
   */
  addressToItemMap: Map<string, Maybe<StoredItemFragment>>;

  /**
   * If this location has a size, this is the currently selected address.
   * Will start on the first empty address. When a user scans in a barcode, will move to the next empty address.
   */
  selectedAddress: Maybe<string>;

  /**
   * The current success message
   */
  successMessage: Maybe<string>;

  /**
   * The current error message
   */
  errorMessage: Maybe<string>;
}

/**
 * State Schema for a Location Machine
 */
export interface LocationSchema {
  states: {
    fetching: {};
    notFound: {};
    ready: {};
    updating: {
      states: {
        storingBarcode: {};
        unstoringBarcode: {};
        emptyingLocation: {};
      };
    };
  };
}

/**
 * Location events
 */
type FetchLocationEvent = {
  type: "FETCH_LOCATION";
  barcode: string;
  locationSearchParams: Maybe<LocationSearchParams>;
};

type FetchLocationResolveEvent = {
  type: "done.invoke.fetchLocation";
  data: LocationFieldsFragment;
};

type StoreBarcodeEvent = {
  type: "STORE_BARCODE";
  barcode: string;
  address?: string;
};

type StoreBarcodeResolveEvent = {
  type: "done.invoke.storeBarcode";
  data: LocationFieldsFragment;
};

type UnstoreBarcodeEvent = {
  type: "UNSTORE_BARCODE";
  barcode: string;
};

type UnstoreBarcodeResolveEvent = {
  type: "done.invoke.unstoreBarcode";
  data: LocationFieldsFragment;
};

type EmptyLocationEvent = {
  type: "EMPTY_LOCATION";
};

type EmptyLocationResolveEvent = {
  type: "done.invoke.emptyLocation";
  data: LocationFieldsFragment;
};

type UpdateLocationEvent = {
  type: "UPDATE_LOCATION";
  location: LocationFieldsFragment;
};

type SetSelectedAddressEvent = {
  type: "SET_SELECTED_ADDRESS";
  address: string;
};

type SetSuccessMessageEvent = {
  type: "SET_SUCCESS_MESSAGE";
  message: string;
};

type SetErrorMessageEvent = {
  type: "SET_ERROR_MESSAGE";
  message: string;
};

export type LocationEvent =
  | FetchLocationEvent
  | FetchLocationResolveEvent
  | StoreBarcodeEvent
  | StoreBarcodeResolveEvent
  | UnstoreBarcodeEvent
  | UnstoreBarcodeResolveEvent
  | EmptyLocationEvent
  | EmptyLocationResolveEvent
  | UpdateLocationEvent
  | SetSelectedAddressEvent
  | SetSuccessMessageEvent
  | SetErrorMessageEvent;

/**
 * The type of an interpreted Location Machine
 */
export type LocationMachineService = Interpreter<
  LocationContext,
  LocationSchema,
  LocationEvent
>;

export type LocationMachine = StateNode<
  LocationContext,
  LocationSchema,
  LocationEvent
>;

export type LocationState = State<
  LocationContext,
  LocationEvent,
  LocationSchema
>;

export type StoredItemFragment = LocationFieldsFragment["stored"][number];

/**
 * Event creator for {@link SetSuccessMessageEvent}
 * @param message the success message
 */
export function setSuccessMessage(message: string): LocationEvent {
  return {
    type: "SET_SUCCESS_MESSAGE",
    message,
  };
}

/**
 * Event creator for {@link SetErrorMessageEvent}
 * @param message the error message
 */
export function setErrorMessage(message: string): LocationEvent {
  return {
    type: "SET_ERROR_MESSAGE",
    message,
  };
}
