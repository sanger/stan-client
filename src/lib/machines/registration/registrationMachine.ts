import { Machine } from "xstate";
import registrationService from "../../services/registrationService";
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
        type: "parallel" as const, // https://github.com/davidkpiano/xstate/issues/965#issuecomment-579773494
        states: {
          [State.FETCHING_REGISTRATION_INFO]: {
            initial: State.FETCHING,
            states: {
              [State.FETCHING]: {
                // When we enter the "fetching" state, invoke the getRegistrationInfo service.
                // https://xstate.js.org/docs/guides/communication.html#quick-reference
                invoke: {
                  id: "getRegistrationInfo",
                  src: registrationService.getRegistrationInfo,
                  onDone: {
                    target: State.FETCHING_FINISHED,
                    actions: Actions.ASSIGN_REGISTRATION_INFO,
                  },
                  onError: {
                    target: State.ERROR_FQ,
                    actions: Actions.ASSIGN_LOADING_ERROR,
                  },
                },
              },
              [State.FETCHING_FINISHED]: { type: "final" },
            },
          },
          [State.MINIMUM_WAIT]: {
            initial: State.WAITING,
            states: {
              [State.WAITING]: {
                after: {
                  500: State.MINIMUM_WAIT_FINISHED,
                },
              },
              [State.MINIMUM_WAIT_FINISHED]: { type: "final" },
            },
          },
        },
        onDone: State.LOADED,
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
            actions: Actions.ASSIGN_REGISTRATION_RESULT,
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
        type: "final" as const,
      },
    },
  },
  registrationMachineOptions
);

export default registrationMachine;
