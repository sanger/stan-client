import { MachineConfig, MachineOptions } from "xstate";
import {
  DestroyContext,
  DestroySchema,
  DestroyEvent,
} from "./destroyMachineTypes";
import { assign } from "@xstate/immer";
import * as destroyService from "../../services/destroyService";
import { createMachineBuilder } from "../index";
import { castDraft } from "immer";

/**
 * Destroy Machine Options
 */
const machineOptions: Partial<MachineOptions<DestroyContext, DestroyEvent>> = {
  actions: {
    assignDestroyResult: assign((ctx, e) => {
      if (e.type !== "done.invoke.destroy") {
        return;
      }
      ctx.destroyResult = e.data;
    }),

    unsetServerError: assign((ctx) => (ctx.serverError = null)),

    assignServerError: assign((ctx, e) => {
      if (e.type !== "error.platform.destroy") {
        return;
      }
      ctx.serverError = castDraft(e.data);
    }),
  },
  services: {
    destroy: (ctx, e) => {
      if (e.type !== "SUBMIT") {
        return Promise.reject();
      }
      return destroyService.destroy(e.request);
    },
  },
};

/**
 * Destroy Machine Config
 */
export const machineConfig: MachineConfig<
  DestroyContext,
  DestroySchema,
  DestroyEvent
> = {
  id: "destroy",
  initial: "ready",
  states: {
    ready: {
      on: {
        SUBMIT: "destroying",
      },
    },
    destroying: {
      entry: "unsetServerError",
      invoke: {
        src: "destroy",
        onDone: {
          target: "destroyed",
          actions: "assignDestroyResult",
        },
        onError: {
          target: "ready",
          actions: "assignServerError",
        },
      },
    },
    destroyed: {
      type: "final",
    },
  },
};

const createDestroyMachine = createMachineBuilder<
  DestroyContext,
  DestroySchema,
  DestroyEvent
>(machineConfig, machineOptions);

export default createDestroyMachine;
