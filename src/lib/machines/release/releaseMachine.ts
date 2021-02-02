import { MachineConfig, MachineOptions } from "xstate";
import {
  ReleaseContext,
  ReleaseEvent,
  ReleaseSchema,
} from "./releaseMachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";
import * as releaseService from "../../services/releaseService";
import { extractServerErrors } from "../../../types/stan";

/**
 * Release Machine Options
 */
const machineOptions: Partial<MachineOptions<ReleaseContext, ReleaseEvent>> = {
  actions: {
    resetServerErrors: assign((ctx, _e) => {
      ctx.serverErrors = undefined;
    }),

    assignReleaseErrors: assign((ctx, e) => {
      if (e.type !== "error.platform.releaseLabware") {
        return;
      }
      ctx.serverErrors = extractServerErrors(e.data);
    }),
  },
  services: {
    releaseLabware: (ctx, e) => {
      if (e.type !== "SUBMIT") {
        return Promise.reject();
      }
      return releaseService.releaseLabware({ releaseRequest: e.formValues });
    },
  },
};

/**
 * Release Machine Config
 */
export const machineConfig: MachineConfig<
  ReleaseContext,
  ReleaseSchema,
  ReleaseEvent
> = {
  id: "release",
  initial: "ready",
  states: {
    ready: {
      on: {
        SUBMIT: "submitting",
      },
    },
    submitting: {
      entry: "resetServerErrors",
      invoke: {
        src: "releaseLabware",
        onError: {
          target: "ready",
          actions: "assignReleaseErrors",
        },
        onDone: {
          target: "submitted",
        },
      },
    },
    submitted: {
      type: "final",
    },
  },
};

const createReleaseMachine = createMachineBuilder<
  ReleaseContext,
  ReleaseSchema,
  ReleaseEvent
>(machineConfig, machineOptions);

export default createReleaseMachine;
