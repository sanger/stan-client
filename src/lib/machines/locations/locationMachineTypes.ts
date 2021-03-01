import { Interpreter, State, StateNode } from "xstate";
import { LocationFieldsFragment, Maybe } from "../../../types/graphql";
import { ApolloError } from "@apollo/client";
import { LocationSearchParams } from "../../../types/stan";

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

  /**
   * Error that's come back from a request to core
   */
  serverError: Maybe<ApolloError>;
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

type FetchLocationErrorEvent = {
  type: "error.platform.fetchLocation";
  data: ApolloError;
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

type StoreBarcodeErrorEvent = {
  type: "error.platform.storeBarcode";
  data: ApolloError;
};

type UnstoreBarcodeEvent = {
  type: "UNSTORE_BARCODE";
  barcode: string;
};

type UnstoreBarcodeResolveEvent = {
  type: "done.invoke.unstoreBarcode";
  data: LocationFieldsFragment;
};

type UnstoreBarcodeErrorEvent = {
  type: "error.platform.unstoreBarcode";
  data: ApolloError;
};

type EmptyLocationEvent = {
  type: "EMPTY_LOCATION";
};

type EmptyLocationResolveEvent = {
  type: "done.invoke.emptyLocation";
  data: LocationFieldsFragment;
};

type EmptyLocationErrorEvent = {
  type: "error.platform.emptyLocation";
  data: ApolloError;
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
  | FetchLocationErrorEvent
  | StoreBarcodeEvent
  | StoreBarcodeResolveEvent
  | StoreBarcodeErrorEvent
  | UnstoreBarcodeEvent
  | UnstoreBarcodeResolveEvent
  | UnstoreBarcodeErrorEvent
  | EmptyLocationEvent
  | EmptyLocationResolveEvent
  | EmptyLocationErrorEvent
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
