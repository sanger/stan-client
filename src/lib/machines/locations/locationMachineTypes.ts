import { LocationFieldsFragment, Maybe, StoreInput } from '../../../types/sdk';
import { ClientError } from 'graphql-request';
import { LocationSearchParams } from '../../../types/stan';

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
  locationAddresses: Map<string, number>;

  /**
   * A map of location address to stored item
   */
  addressToItemMap: Map<string, StoredItemFragment>;

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
  serverError: Maybe<ClientError>;
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
        storing: {};
      };
    };
  };
}

/**
 * Location events
 */
type FetchLocationEvent = {
  type: 'FETCH_LOCATION';
  barcode: string;
  locationSearchParams: Maybe<LocationSearchParams>;
};

type FetchLocationResolveEvent = {
  type: 'xstate.done.actor.fetchLocation';
  output: LocationFieldsFragment;
};

type FetchLocationErrorEvent = {
  type: 'xstate.error.actor.fetchLocation';
  error: ClientError;
};

export type StoreBarcodeEvent = {
  type: 'STORE_BARCODE';
  barcode: string;
  address?: string;
};

type StoreBarcodeResolveEvent = {
  type: 'xstate.done.actor.storeBarcode';
  output: LocationFieldsFragment;
};

type StoreBarcodeErrorEvent = {
  type: 'xstate.error.actor.storeBarcode';
  error: ClientError;
};

type UnstoreBarcodeEvent = {
  type: 'UNSTORE_BARCODE';
  barcode: string;
};

type UnstoreBarcodeResolveEvent = {
  type: 'xstate.done.actor.unstoreBarcode';
  output: LocationFieldsFragment;
};

type UnstoreBarcodeErrorEvent = {
  type: 'xstate.error.actor.unstoreBarcode';
  error: ClientError;
};

type EmptyLocationEvent = {
  type: 'EMPTY_LOCATION';
};

type EmptyLocationResolveEvent = {
  type: 'xstate.done.actor.emptyLocation';
  output: LocationFieldsFragment;
};

type EmptyLocationErrorEvent = {
  type: 'xstate.error.actor.emptyLocation';
  error: ClientError;
};

type UpdateLocationEvent = {
  type: 'UPDATE_LOCATION';
  location: LocationFieldsFragment;
};

type SetSelectedAddressEvent = {
  type: 'SET_SELECTED_ADDRESS';
  address: string;
};

type SetSuccessMessageEvent = {
  type: 'SET_SUCCESS_MESSAGE';
  message: string;
};

type SetErrorMessageEvent = {
  type: 'SET_ERROR_MESSAGE';
  message: string;
};

type StoreEvent = {
  type: 'STORE';
  data: StoreInput[];
};

type StoreResolveEvent = {
  type: 'xstate.done.actor.store';
  output: LocationFieldsFragment;
};

type StoreErrorEvent = {
  type: 'error.platform.store';
  error: ClientError;
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
  | SetErrorMessageEvent
  | StoreEvent
  | StoreResolveEvent
  | StoreErrorEvent;

/**
 * The type of an interpreted Location Machine
 */

export type StoredItemFragment = LocationFieldsFragment['stored'][number];

/**
 * Event creator for {@link SetSuccessMessageEvent}
 * @param message the success message
 */
export function setSuccessMessage(message: string): LocationEvent {
  return {
    type: 'SET_SUCCESS_MESSAGE',
    message
  };
}

/**
 * Event creator for {@link SetErrorMessageEvent}
 * @param message the error message
 */
export function setErrorMessage(message: string): LocationEvent {
  return {
    type: 'SET_ERROR_MESSAGE',
    message
  };
}
