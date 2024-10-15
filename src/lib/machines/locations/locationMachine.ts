import { assign, createMachine, fromPromise, MachineConfig, MachineImplementations, raise } from 'xstate';
import {
  LocationContext,
  LocationEvent,
  setErrorMessage,
  setSuccessMessage,
  StoreBarcodeEvent,
  StoredItemFragment
} from './locationMachineTypes';
import * as locationService from '../../services/locationService';
import { castDraft, produce } from '../../../dependencies/immer';
import { stanCore } from '../../sdk';
import { GridDirection, LocationFieldsFragment } from '../../../types/sdk';
import { buildOrderedAddresses, findNextAvailableAddress } from '../../helpers/locationHelper';

enum Action {
  ASSIGN_LOCATION = 'assignLocation',
  ASSIGN_LOCATION_SEARCH_PARAMS = 'assignLocationSearchParams',
  ASSIGN_SELECTED_ADDRESS = 'assignSelectedAddress',
  UNSET_SUCCESS_MESSAGE = 'unsetSuccessMessage',
  ASSIGN_SUCCESS_MESSAGE = 'assignSuccessMessage',
  ASSIGN_ERROR_MESSAGE = 'assignErrorMessage',
  ASSIGN_SERVER_ERRORS = 'assignServerErrors',
  UPDATE_PARENT_LEAF_MAP = 'updateParentLeafMap'
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
export const machineOptions: MachineImplementations<LocationContext, LocationEvent> = {
  actions: {
    [Action.ASSIGN_LOCATION_SEARCH_PARAMS]: assign(({ context, event }) => {
      if (event.type !== 'FETCH_LOCATION') {
        return context;
      }
      return { ...context, locationSearchParams: event.locationSearchParams };
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
      if (event.type !== 'UPDATE_LOCATION' && event.output == null) {
        return context;
      }

      const location = event.type === 'UPDATE_LOCATION' ? event.location : event.output;
      const addressToItemMap = new Map<string, StoredItemFragment>();
      //  Create all the possible addresses for this location if it has a size.
      const locationAddresses = location.size
        ? buildOrderedAddresses(location.size, location.direction ?? GridDirection.DownRight)
        : new Map<string, number>();

      location.stored.forEach((storedItem) => {
        if (storedItem.address) {
          addressToItemMap.set(storedItem.address, storedItem);
        }
      });
      const addresses = findNextAvailableAddress({
        locationAddresses,
        addressToItemMap,
        minimumAddress: context.selectedAddress
      });
      const selectedAddress = addresses.length > 0 ? addresses[0] : null;
      return { ...context, location, addressToItemMap, locationAddresses, selectedAddress };
    }),

    [Action.ASSIGN_SELECTED_ADDRESS]: assign(({ context, event }) => {
      if (event.type !== 'SET_SELECTED_ADDRESS') {
        return context;
      }
      return { ...context, selectedAddress: event.address };
    }),

    [Action.UNSET_SUCCESS_MESSAGE]: assign(({ context }) => {
      return { ...context, successMessage: null };
    }),

    [Action.ASSIGN_SUCCESS_MESSAGE]: assign(({ context, event }) => {
      if (event.type !== 'SET_SUCCESS_MESSAGE') {
        return context;
      }
      return { ...context, successMessage: event.message, errorMessage: null };
    }),

    [Action.ASSIGN_ERROR_MESSAGE]: assign(({ context, event }) => {
      if (event.type !== 'SET_ERROR_MESSAGE') {
        return context;
      }
      return { ...context, errorMessage: event.message, successMessage: null };
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
      return { ...context, serverError: castDraft(event.error) };
    }),
    [Action.UPDATE_PARENT_LEAF_MAP]: assign(({ context, event }) => {
      if (event.type !== 'UPDATE_PARENT_LEAF_MAP') {
        return context;
      }
      return produce(context, (draft) => {
        draft.parentLeafMap.set(event.locationFamily.parent.barcode, event.locationFamily.children.length === 0);
        event.locationFamily.children.forEach((location: LocationFieldsFragment) => {
          draft.parentLeafMap.set(location.barcode, location.children.length === 0);
        });
      });
    })
  }
};

export const machineConfig: MachineConfig<LocationContext, LocationEvent> = {
  id: 'locations',
  initial: 'ready',
  context: ({ input }) => {
    const parentLeafMap = new Map(
      input.locationFamily.children.map((child: LocationFieldsFragment) => [child.barcode, child.children.length === 0])
    );
    parentLeafMap.set(input.locationFamily.parent.barcode, input.locationFamily.children.length === 0);
    return {
      ...input,
      parentLeafMap
    };
  },
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
        UPDATE_PARENT_LEAF_MAP: { actions: Action.UPDATE_PARENT_LEAF_MAP },
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
              if (event.type !== 'UNSTORE_BARCODE') {
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

export const locationMachine = createMachine(
  {
    ...machineConfig
  },
  {
    ...machineOptions
  }
);
