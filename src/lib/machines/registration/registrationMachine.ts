import { MachineConfig, MachineOptions } from "xstate";
import {
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema,
} from "./registrationMachineTypes";
import { assign } from "@xstate/immer";
import { extractServerErrors } from "../../../types/stan";
import * as registrationService from "../../services/registrationService";
import { buildRegisterTissuesMutationVariables } from "../../services/registrationService";
import { createMachineBuilder } from "../index";

export enum Actions {
  ASSIGN_LOADING_ERROR = "assignLoadingError",
  ASSIGN_REGISTRATION_RESULT = "assignRegistrationResult",
  ASSIGN_REGISTRATION_ERROR = "assignRegistrationError",
}

export enum Services {
  SUBMIT = "submit",
}

export const machineOptions: Partial<MachineOptions<
  RegistrationContext,
  RegistrationEvent
>> = {
  actions: {
    [Actions.ASSIGN_REGISTRATION_RESULT]: assign((ctx, e) => {
      if (e.type !== "done.invoke.submitting" || !e.data.data) {
        return;
      }
      ctx.registrationResult = e.data.data;
    }),

    [Actions.ASSIGN_REGISTRATION_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform.submitting") {
        return;
      }
      ctx.registrationErrors = extractServerErrors(e.data);
    }),
  },

  services: {
    [Services.SUBMIT]: (context, event) => {
      if (event.type !== "SUBMIT_FORM") {
        return Promise.reject();
      }
      return buildRegisterTissuesMutationVariables(event.values).then(
        registrationService.registerTissues
      );
    },
  },
};

/**
 * XState state machine for Registration
 */

const machineConfig: MachineConfig<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
> = {
  id: "registration",
  initial: "ready",
  states: {
    ready: {
      on: {
        SUBMIT_FORM: "submitting",
      },
    },
    submitting: {
      invoke: {
        id: "submitting",
        src: "submit",
        onDone: {
          target: "complete",
          actions: [Actions.ASSIGN_REGISTRATION_RESULT],
        },
        onError: {
          target: "submissionError",
          actions: Actions.ASSIGN_REGISTRATION_ERROR,
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

const createRegistrationMachine = createMachineBuilder(
  machineConfig,
  machineOptions
);

export default createRegistrationMachine;
