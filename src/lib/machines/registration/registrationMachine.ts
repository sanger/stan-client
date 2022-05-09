import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { extractServerErrors, ServerErrors } from "../../../types/stan";
import { ClientError } from "graphql-request";
import { Maybe, RegisterResultFieldsFragment } from "../../../types/sdk";

export interface RegistrationContext<F, M> {
  registrationFormInput: Maybe<F>;
  buildRegistrationInput: (
    formInput: F,
    existingTissues?: Array<string>
  ) => Promise<M>;
  registrationService: (
    mutationInput: M
  ) => Promise<RegisterResultFieldsFragment>;
  registrationResult: Maybe<RegisterResultFieldsFragment>;
  registrationErrors: Maybe<ServerErrors>;
  confirmedTissues: Array<string>;
}

type SubmitFormEvent<F> = {
  type: "SUBMIT_FORM";
  values: F;
};

type EditSubmissionEvent = {
  type: "EDIT_SUBMISSION";
};

type SubmittingDoneEvent = {
  type: "done.invoke.submitting";
  data: RegisterResultFieldsFragment;
};

type SubmittingErrorEvent = {
  type: "error.platform.submitting";
  data: ClientError;
};

export type RegistrationEvent<F> =
  | SubmitFormEvent<F>
  | EditSubmissionEvent
  | SubmittingDoneEvent
  | SubmittingErrorEvent;

/**
 * XState state machine for Registration
 */
export function createRegistrationMachine<F, M>(
  buildRegistrationInput: (
    formInput: F,
    existingTissues?: Array<string>
  ) => Promise<M>,
  registrationService: (
    mutationInput: M
  ) => Promise<RegisterResultFieldsFragment>
) {
  return createMachine<RegistrationContext<F, M>, RegistrationEvent<F>>(
    {
      context: {
        registrationFormInput: null,
        buildRegistrationInput,
        registrationService,
        registrationResult: null,
        registrationErrors: null,
        confirmedTissues: [],
      },
      id: "registration",
      initial: "ready",
      states: {
        ready: {
          entry: ["emptyConfirmedTissues"],
          on: {
            SUBMIT_FORM: "submitting",
          },
        },
        submitting: {
          invoke: {
            id: "submitting",
            src: "submit",
            onDone: {
              target: "checkSubmissionClashes",
              actions: ["assignRegistrationResult"],
            },
            onError: {
              target: "submissionError",
              actions: "assignRegistrationError",
            },
          },
        },
        checkSubmissionClashes: {
          always: [
            {
              cond: "isClash",
              target: "clashed",
            },
            {
              target: "complete",
            },
          ],
        },
        clashed: {
          on: {
            EDIT_SUBMISSION: "ready",
            SUBMIT_FORM: "submitting",
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
    },
    {
      actions: {
        emptyConfirmedTissues: assign((ctx) => (ctx.confirmedTissues = [])),

        assignRegistrationResult: assign((ctx, e) => {
          if (e.type !== "done.invoke.submitting" || !e.data) {
            return;
          }
          ctx.registrationResult = e.data;

          // Store the clashed tissues to be used for possible user confirmation
          ctx.confirmedTissues = ctx.registrationResult.clashes.map(
            (clash) => clash.tissue.externalName
          );
        }),

        assignRegistrationError: assign((ctx, e) => {
          if (e.type !== "error.platform.submitting") {
            return;
          }
          ctx.registrationErrors = extractServerErrors(e.data);
        }),
      },

      guards: {
        isClash: (ctx) =>
          ctx.registrationResult !== null &&
          ctx.registrationResult.clashes.length > 0,
      },

      services: {
        submit: (context, event) => {
          if (event.type !== "SUBMIT_FORM") {
            return Promise.reject();
          }
          return buildRegistrationInput(
            event.values,
            context.confirmedTissues
          ).then(context.registrationService);
        },
      },
    }
  );
}
