import { Machine } from "xstate";
import { RegistrationContext } from "./registrationContext";
import { RegistrationSchema, State } from "./registrationStates";
import { RegistrationEvent } from "./registrationEvents";
import {
  Actions,
  registrationMachineOptions,
  Services,
} from "./registrationMachineOptions";

/**
 * XState state machine for Registration
 */
const registrationMachine = Machine<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
>(
  {
    id: "registration",
    initial: State.LOADING,
    states: {
      [State.LOADING]: {
        invoke: {
          id: "getRegistrationInfo",
          src: Services.GET_REGISTRATION_INFO,
          onDone: {
            target: State.LOADED,
            actions: Actions.ASSIGN_REGISTRATION_INFO,
          },
          onError: {
            target: State.ERROR,
            actions: Actions.ASSIGN_REGISTRATION_ERROR,
          },
        },
      },
      [State.LOADED]: {
        on: {
          SUBMIT_FORM: State.SUBMITTING,
        },
      },
      [State.ERROR]: {
        on: {
          RETRY: State.LOADING,
        },
      },
      [State.SUBMITTING]: {
        invoke: {
          id: "submitting",
          src: Services.SUBMIT,
          onDone: {
            target: State.COMPLETE,
            actions: [Actions.ASSIGN_REGISTRATION_RESULT],
          },
          onError: {
            target: State.SUBMISSION_ERROR,
            actions: Actions.ASSIGN_REGISTRATION_ERROR,
          },
        },
      },
      [State.SUBMISSION_ERROR]: {
        on: {
          SUBMIT_FORM: State.SUBMITTING,
        },
      },
      [State.COMPLETE]: {
        entry: Actions.SPAWN_LABEL_PRINTER,
      },
    },
  },
  registrationMachineOptions
);

export default registrationMachine;
