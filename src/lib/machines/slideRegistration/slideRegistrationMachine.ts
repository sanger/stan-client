import { MachineConfig, MachineOptions } from "xstate";
import {
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent,
} from "./slideRegistrationMachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";
import * as registrationService from "../../services/registrationService";
import { castDraft } from "immer";

/**
 * SlideRegistration Machine Options
 */
const machineOptions: Partial<MachineOptions<
  SlideRegistrationContext,
  SlideRegistrationEvent
>> = {
  actions: {
    assignInitialLabware: assign((ctx, e) => {
      if (e.type !== "SELECT_INITIAL_LABWARE") {
        return;
      }
      ctx.initialLabwareType = e.labwareType;
    }),

    assignRegistrationResult: assign((ctx, e) => {
      if (e.type !== "done.invoke.submitForm") {
        return;
      }
      ctx.registrationResult = e.data;
    }),

    assignRegistrationError: assign((ctx, e) => {
      if (e.type !== "error.platform.submitForm") {
        return;
      }
      ctx.registrationErrors = castDraft(e.data);
    }),
  },

  services: {
    submitForm: (ctx, e) => {
      if (e.type !== "SUBMIT_FORM") {
        return Promise.reject();
      }
      return registrationService.registerSections(e.values);
    },
  },
};

/**
 * SlideRegistration Machine Config
 */
export const machineConfig: MachineConfig<
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent
> = {
  id: "slideRegistration",
  initial: "selectingInitialLabware",
  states: {
    selectingInitialLabware: {
      on: {
        SELECT_INITIAL_LABWARE: {
          target: "ready",
          actions: "assignInitialLabware",
        },
      },
    },
    ready: {
      on: {
        SUBMIT_FORM: "submitting",
      },
    },
    submitting: {
      invoke: {
        src: "submitForm",
        onDone: {
          actions: "assignRegistrationResult",
          target: "complete",
        },
        onError: {
          actions: "assignRegistrationError",
          target: "submissionError",
        },
      },
    },
    submissionError: {
      on: {
        SUBMIT_FORM: "submitting",
      },
    },
    complete: {
      type: "final",
    },
  },
};

const createSlideRegistrationMachine = createMachineBuilder<
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent
>(machineConfig, machineOptions);

export default createSlideRegistrationMachine;
