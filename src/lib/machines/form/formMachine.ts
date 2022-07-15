import { MachineServiceDone, MachineServiceError } from "../../../types/stan";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";
import { ClientError } from "graphql-request";

export interface FormContext<R> {
  submissionResult?: R;
  serverError?: ClientError;
}

export type FormEvent<V, R> =
  | {
      type: "SUBMIT_FORM";
      values: V;
    }
  | { type: "RESET" }
  | MachineServiceDone<"submitForm", R>
  | MachineServiceError<"submitForm">;

/**
 * Create a form machine
 */
export default function createFormMachine<V, R>() {
  return createMachine<FormContext<R>, FormEvent<V, R>>(
    {
      id: "createFormMachine",
      initial: "fillingOutForm",
      states: {
        fillingOutForm: {
          on: {
            SUBMIT_FORM: "submitting",
          },
        },
        submitting: {
          entry: "unsetServerError",
          invoke: {
            src: "submitForm",
            id: "submitForm",
            onDone: {
              target: "submitted",
              actions: "assignSubmissionResult",
            },
            onError: {
              target: "fillingOutForm",
              actions: "assignSubmissionError",
            },
          },
        },
        submitted: {
          on: {
            RESET: {
              target: "fillingOutForm",
              actions: "unsetSubmissionResult",
            },
          },
        },
      },
    },
    {
      actions: {
        unsetServerError: assign((ctx) => (ctx.serverError = undefined)),

        unsetSubmissionResult: assign(
          (ctx) => (ctx.submissionResult = undefined)
        ),

        assignSubmissionResult: assign((ctx, e) => {
          if (e.type !== "done.invoke.submitForm") {
            return;
          }
          ctx.submissionResult = castDraft(e.data);
        }),

        assignSubmissionError: assign((ctx, e) => {
          if (e.type !== "error.platform.submitForm") {
            return;
          }
          ctx.serverError = castDraft(e.data);
        }),
      },
    }
  );
}
