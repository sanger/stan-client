import { MachineOptions, send } from "xstate";
import { assign } from "@xstate/immer";
import {
  LocationContext,
  LocationEvent,
  LocationSchema,
  setErrorMessage,
  setSuccessMessage,
  StoredItemFragment,
} from "./locationMachineTypes";
import * as locationService from "../../services/locationService";
import { Maybe } from "../../../types/graphql";
import { MachineConfig } from "xstate/lib/types";
import { createMachineBuilder } from "../index";
import { castDraft } from "immer";

enum Action {
  ASSIGN_LOCATION = "assignLocation",
  ASSIGN_LOCATION_SEARCH_PARAMS = "assignLocationSearchParams",
  ASSIGN_SELECTED_ADDRESS = "assignSelectedAddress",
  UNSET_SUCCESS_MESSAGE = "unsetSuccessMessage",
  ASSIGN_SUCCESS_MESSAGE = "assignSuccessMessage",
  ASSIGN_ERROR_MESSAGE = "assignErrorMessage",
  ASSIGN_SERVER_ERRORS = "assignServerErrors",
}

enum Service {
  FETCH_LOCATION = "fetchLocation",
  STORE_BARCODE = "storeBarcode",
  UNSTORE_BARCODE = "unstoreBarcode",
  EMPTY_LOCATION = "emptyLocation",
}

/**
 * Location Machine Options
 */
export const machineOptions: Partial<MachineOptions<
  LocationContext,
  LocationEvent
>> = {
  actions: {
    [Action.ASSIGN_LOCATION_SEARCH_PARAMS]: assign((ctx, e) => {
      if (e.type !== "FETCH_LOCATION") {
        return;
      }

      ctx.locationSearchParams = e.locationSearchParams;
    }),

    [Action.ASSIGN_LOCATION]: assign((ctx, e) => {
      if (
        e.type !== "done.invoke.fetchLocation" &&
        e.type !== "done.invoke.storeBarcode" &&
        e.type !== "done.invoke.unstoreBarcode" &&
        e.type !== "done.invoke.emptyLocation" &&
        e.type !== "UPDATE_LOCATION"
      ) {
        return;
      }

      // Can be null if this is an unstore action
      if (e.type !== "UPDATE_LOCATION" && e.data == null) {
        return;
      }

      // Set the location
      ctx.location = e.type === "UPDATE_LOCATION" ? e.location : e.data;

      ctx.addressToItemMap = new Map<string, Maybe<StoredItemFragment>>(
        ctx.locationAddresses.map((address) => [
          address,
          ctx.location.stored.find((item) => item.address === address) ?? null,
        ])
      );

      // Determine the next address
      let selectedAddressIndex = 0;
      if (ctx.selectedAddress !== null) {
        selectedAddressIndex = Array.from(ctx.locationAddresses).indexOf(
          ctx.selectedAddress
        );
      }

      ctx.selectedAddress =
        ctx.locationAddresses
          .filter((address, index) => index >= selectedAddressIndex)
          .find((address) => ctx.addressToItemMap.get(address) == null) ?? null;
    }),

    [Action.ASSIGN_SELECTED_ADDRESS]: assign((ctx, e) => {
      if (e.type !== "SET_SELECTED_ADDRESS") {
        return;
      }
      ctx.selectedAddress = e.address;
    }),

    [Action.UNSET_SUCCESS_MESSAGE]: assign((ctx, _e) => {
      ctx.successMessage = null;
    }),

    [Action.ASSIGN_SUCCESS_MESSAGE]: assign((ctx, e) => {
      if (e.type !== "SET_SUCCESS_MESSAGE") {
        return;
      }
      ctx.successMessage = e.message;
      ctx.errorMessage = null;
    }),

    [Action.ASSIGN_ERROR_MESSAGE]: assign((ctx, e) => {
      if (e.type !== "SET_ERROR_MESSAGE") {
        return;
      }
      ctx.errorMessage = e.message;
      ctx.successMessage = null;
    }),

    [Action.ASSIGN_SERVER_ERRORS]: assign((ctx, e) => {
      if (
        e.type !== "error.platform.fetchLocation" &&
        e.type !== "error.platform.storeBarcode" &&
        e.type !== "error.platform.unstoreBarcode" &&
        e.type !== "error.platform.emptyLocation"
      ) {
        return;
      }
      ctx.serverError = castDraft(e.data);
    }),
  },

  services: {
    [Service.FETCH_LOCATION]: (ctx, e) => {
      if (e.type !== "FETCH_LOCATION") {
        return Promise.reject();
      }
      return locationService.findLocationByBarcode(e.barcode, {
        fetchPolicy: "network-only",
      });
    },

    [Service.STORE_BARCODE]: (ctx, e) => {
      if (e.type !== "STORE_BARCODE") {
        return Promise.reject();
      }
      return locationService.storeBarcode(e.barcode, ctx.location, e.address);
    },

    [Service.UNSTORE_BARCODE]: async (ctx, e) => {
      if (e.type !== "UNSTORE_BARCODE") {
        return Promise.reject();
      }
      await locationService.unstoreBarcode(e.barcode);
      return locationService.findLocationByBarcode(ctx.location.barcode, {
        fetchPolicy: "network-only",
      });
    },

    [Service.EMPTY_LOCATION]: (ctx, _e) =>
      locationService.emptyLocation(ctx.location.barcode),
  },
};

export const machineConfig: MachineConfig<
  LocationContext,
  LocationSchema,
  LocationEvent
> = {
  id: "locations",
  initial: "ready",
  states: {
    fetching: {
      invoke: {
        src: Service.FETCH_LOCATION,
        onDone: {
          actions: [Action.ASSIGN_LOCATION],
          target: "ready",
        },
        onError: "notFound",
      },
    },
    ready: {
      on: {
        FETCH_LOCATION: "fetching",
        UPDATE_LOCATION: { actions: Action.ASSIGN_LOCATION },
        STORE_BARCODE: "updating.storingBarcode",
        UNSTORE_BARCODE: "updating.unstoringBarcode",
        EMPTY_LOCATION: "updating.emptyingLocation",
        SET_SELECTED_ADDRESS: { actions: Action.ASSIGN_SELECTED_ADDRESS },
        SET_SUCCESS_MESSAGE: { actions: Action.ASSIGN_SUCCESS_MESSAGE },
        SET_ERROR_MESSAGE: { actions: Action.ASSIGN_ERROR_MESSAGE },
      },
    },
    updating: {
      entry: Action.UNSET_SUCCESS_MESSAGE,
      states: {
        storingBarcode: {
          invoke: {
            src: Service.STORE_BARCODE,
            onDone: {
              actions: [
                Action.ASSIGN_LOCATION,
                send(setSuccessMessage("Barcode successfully stored")),
              ],
              target: [`#locations.ready`],
            },
            onError: {
              actions: [
                send(setErrorMessage("Barcode could not be stored")),
                Action.ASSIGN_SERVER_ERRORS,
              ],
              target: [`#locations.ready`],
            },
          },
        },
        unstoringBarcode: {
          invoke: {
            src: Service.UNSTORE_BARCODE,
            onDone: {
              actions: [
                Action.ASSIGN_LOCATION,
                send(setSuccessMessage("Barcode successfully unstored")),
              ],
              target: ["#locations.ready"],
            },
            onError: {
              actions: [
                send(setErrorMessage("Barcode could not be unstored")),
                Action.ASSIGN_SERVER_ERRORS,
              ],
              target: [`#locations.ready`],
            },
          },
        },
        emptyingLocation: {
          invoke: {
            src: Service.EMPTY_LOCATION,
            onDone: {
              actions: [
                Action.ASSIGN_LOCATION,
                send(setSuccessMessage("Location emptied")),
              ],
              target: ["#locations.ready"],
            },
            onError: {
              actions: [
                send(setErrorMessage("Location could not be emptied")),
                Action.ASSIGN_SERVER_ERRORS,
              ],
              target: ["#locations.ready"],
            },
          },
        },
      },
    },
    notFound: {},
  },
};

/**
 * Location Machine
 */
const createLocationMachine = createMachineBuilder(
  machineConfig,
  machineOptions
);

export default createLocationMachine;
