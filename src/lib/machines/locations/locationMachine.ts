import { assign, createMachine, fromPromise, MachineConfig, raise } from 'xstate';
import {
  LocationContext,
  LocationEvent,
  LocationSchema,
  setErrorMessage,
  setSuccessMessage,
  StoreBarcodeEvent
} from './locationMachineTypes';
import * as locationService from '../../services/locationService';
import { castDraft } from 'immer';
import { stanCore } from '../../sdk';
import { buildOrderedAddresses, findNextAvailableAddress } from '../../helpers/locationHelper';
import { GridDirection, StoredItem } from '../../../types/sdk';

enum Action {
  ASSIGN_LOCATION = 'assignLocation',
  ASSIGN_LOCATION_SEARCH_PARAMS = 'assignLocationSearchParams',
  ASSIGN_SELECTED_ADDRESS = 'assignSelectedAddress',
  UNSET_SUCCESS_MESSAGE = 'unsetSuccessMessage',
  ASSIGN_SUCCESS_MESSAGE = 'assignSuccessMessage',
  ASSIGN_ERROR_MESSAGE = 'assignErrorMessage',
  ASSIGN_SERVER_ERRORS = 'assignServerErrors'
}

enum Service {
  FETCH_LOCATION = 'fetchLocation',
  STORE_BARCODE = 'storeBarcode',
  UNSTORE_BARCODE = 'unstoreBarcode',
  EMPTY_LOCATION = 'emptyLocation',
  STORE = 'store'
}

/**
 * Location Machine Options
 */
export const machineOptions = {
  types: {} as {
    context: LocationContext;
    events: LocationEvent;
    schema: LocationSchema;
  },
  actions: {
    [Action.ASSIGN_LOCATION_SEARCH_PARAMS]: assign(({ context, event }) => {
      if (event.type !== 'FETCH_LOCATION') {
        return context;
      }
      context.locationSearchParams = event.locationSearchParams;
      return context;
    }),

    [Action.ASSIGN_LOCATION]: assign(({ context, event }) => {
      if (
        event.type !== 'xstate.done.actor.fetchLocation' &&
        event.type !== 'xstate.done.actor.storeBarcode' &&
        event.type !== 'xstate.done.actor.unstoreBarcode' &&
        event.type !== 'xstate.done.actor.emptyLocation' &&
        event.type !== 'xstate.done.actor.store' &&
        event.type !== 'UPDATE_LOCATION'
      ) {
        return context;
      }
      // Can be null if this is an unstore action
      if (event.type !== 'UPDATE_LOCATION' && event.data == null) {
        return context;
      }

      // Set the location
      context.location = event.type === 'UPDATE_LOCATION' ? event.location : event.output;

      context.addressToItemMap.clear();
      // Create all the possible addresses for this location if it has a size.
      context.locationAddresses = context.location.size
        ? buildOrderedAddresses(context.location.size, context.location.direction ?? GridDirection.DownRight)
        : new Map<string, number>();

      context.location.stored.forEach((storedItem: StoredItem) => {
        if (storedItem.address) {
          context.addressToItemMap.set(storedItem.address, storedItem);
        }
      });

      const addresses = findNextAvailableAddress({
        locationAddresses: context.locationAddresses,
        addressToItemMap: context.addressToItemMap,
        minimumAddress: context.selectedAddress
      });
      context.selectedAddress = addresses.length > 0 ? addresses[0] : null;
      return context;
    }),

    [Action.ASSIGN_SELECTED_ADDRESS]: assign(({ context, event }) => {
      if (event.type !== 'SET_SELECTED_ADDRESS') {
        return context;
      }
      context.selectedAddress = event.address;
      return context;
    }),

    [Action.UNSET_SUCCESS_MESSAGE]: assign(({ context }) => {
      context.successMessage = null;
      return context;
    }),

    [Action.ASSIGN_SUCCESS_MESSAGE]: assign(({ context, event }) => {
      if (event.type !== 'SET_SUCCESS_MESSAGE') {
        return context;
      }
      context.successMessage = event.message;
      context.errorMessage = null;
      return context;
    }),

    [Action.ASSIGN_ERROR_MESSAGE]: assign(({ context, event }) => {
      if (event.type !== 'SET_ERROR_MESSAGE') {
        return context;
      }
      context.errorMessage = event.message;
      context.successMessage = null;
      return context;
    }),

    [Action.ASSIGN_SERVER_ERRORS]: assign(({ context, event }) => {
      if (
        event.type !== 'xstate.error.actor.fetchLocation' &&
        event.type !== 'xstate.error.actor.storeBarcode' &&
        event.type !== 'xstate.error.actor.unstoreBarcode' &&
        event.type !== 'xstate.error.actor.emptyLocation' &&
        event.type !== 'xstate.error.actor.store'
      ) {
        return context;
      }
      context.serverError = castDraft(event.error);
      return context;
    })
  }
};

export const machineConfig: MachineConfig<LocationContext, LocationEvent> = {
  id: 'locations',
  initial: 'ready',
  context: ({ input }) => ({
    ...input
  }),
  states: {
    fetching: {
      invoke: {
        id: Service.FETCH_LOCATION,
        src: fromPromise(({ input }) => stanCore.FindLocationByBarcode({ barcode: input.barcode })),
        input: ({ event }) => {
          if (event.type !== 'FETCH_LOCATION') {
            return {};
          }
          return {
            barcode: event.barcode
          };
        },
        onDone: {
          actions: [Action.ASSIGN_LOCATION],
          target: 'ready'
        },
        onError: 'notFound'
      }
    },
    ready: {
      on: {
        FETCH_LOCATION: 'fetching',
        UPDATE_LOCATION: { actions: Action.ASSIGN_LOCATION },
        STORE_BARCODE: 'updating.storingBarcode',
        UNSTORE_BARCODE: 'updating.unstoringBarcode',
        EMPTY_LOCATION: 'updating.emptyingLocation',
        STORE: 'updating.storing',
        SET_SELECTED_ADDRESS: { actions: Action.ASSIGN_SELECTED_ADDRESS },
        SET_SUCCESS_MESSAGE: { actions: Action.ASSIGN_SUCCESS_MESSAGE },
        SET_ERROR_MESSAGE: { actions: Action.ASSIGN_ERROR_MESSAGE }
      }
    },
    updating: {
      entry: Action.UNSET_SUCCESS_MESSAGE,
      initial: 'storingBarcode',
      states: {
        storingBarcode: {
          invoke: {
            id: Service.STORE_BARCODE,
            src: fromPromise(({ input }) => locationService.storeBarcode(input.barcode, input.location, input.address)),
            input: ({ context, event }) => ({
              barcode: (event as StoreBarcodeEvent).barcode,
              location: context.location,
              address: (event as StoreBarcodeEvent).address
            }),
            onDone: {
              actions: [Action.ASSIGN_LOCATION, raise(setSuccessMessage('Barcode successfully stored'))],
              target: [`#locations.ready`]
            },
            onError: {
              actions: [raise(setErrorMessage('Barcode could not be stored')), Action.ASSIGN_SERVER_ERRORS],
              target: [`#locations.ready`]
            }
          }
        },
        storing: {
          invoke: {
            id: Service.STORE,
            src: fromPromise(({ input }) => locationService.store(input.data, input.location)),
            input: ({ context, event }) => {
              if (event.type !== 'STORE') {
                return {};
              }
              return {
                data: event.data,
                location: context.location
              };
            },
            onDone: {
              actions: [Action.ASSIGN_LOCATION, raise(setSuccessMessage('Barcode successfully stored'))],
              target: [`#locations.ready`]
            },
            onError: {
              actions: [raise(setErrorMessage('Barcode could not be stored')), Action.ASSIGN_SERVER_ERRORS],
              target: [`#locations.ready`]
            }
          }
        },
        unstoringBarcode: {
          invoke: {
            src: fromPromise(async ({ input }) => {
              await locationService.unstoreBarcode(input.unstoredBarcode);
              return stanCore.FindLocationByBarcode({ barcode: input.barcode }).then((res) => res.location);
            }),
            input: ({ context, event }) => {
              if (event.type !== 'FETCH_LOCATION') {
                return {};
              }
              return {
                unstoredBarcode: event.barcode,
                barcode: context.location.barcode
              };
            },
            id: Service.UNSTORE_BARCODE,
            onDone: {
              actions: [Action.ASSIGN_LOCATION, raise(setSuccessMessage('Barcode successfully unstored'))],
              target: ['#locations.ready']
            },
            onError: {
              actions: [raise(setErrorMessage('Barcode could not be unstored')), Action.ASSIGN_SERVER_ERRORS],
              target: [`#locations.ready`]
            }
          }
        },
        emptyingLocation: {
          invoke: {
            src: fromPromise(({ input }) => locationService.emptyLocation(input.barcode)),
            input: ({ context }) => ({
              barcode: context.location.barcode
            }),
            id: Service.EMPTY_LOCATION,
            onDone: {
              actions: [Action.ASSIGN_LOCATION, raise(setSuccessMessage('Location emptied'))],
              target: ['#locations.ready']
            },
            onError: {
              actions: [raise(setErrorMessage('Location could not be emptied')), Action.ASSIGN_SERVER_ERRORS],
              target: ['#locations.ready']
            }
          }
        }
      }
    },
    notFound: {}
  }
};

/**
 * Location Machine
 */

export const locationMachine = createMachine({
  ...machineConfig,
  ...machineOptions
});
