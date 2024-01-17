import { assign, createMachine } from 'xstate';
import { castDraft } from 'immer';
import { ServerErrors } from '../../../types/stan';

export interface FormContext<R> {
  submissionResult?: R;
  serverError?: ServerErrors;
}

export type FormEvent<V, R> =
  | {
      type: 'SUBMIT_FORM';
      values: V;
    }
  | { type: 'RESET' }
  | { type: 'xstate.done.actor.submitForm'; output: R }
  | { type: 'xstate.error.actor.submitForm'; error: ServerErrors };

/**
 * Create a form machine
 */
export default function createFormMachine<V, R>() {
  return createMachine(
    {
      types: {
        events: {} as FormEvent<V, R>,
        context: {} as FormContext<R>
      },
      id: 'createFormMachine',
      initial: 'fillingOutForm',
      states: {
        fillingOutForm: {
          on: {
            SUBMIT_FORM: 'submitting'
          }
        },
        submitting: {
          entry: 'unsetServerError',
          invoke: {
            src: 'submitForm',
            input: ({ context, event }) => ({ context, event }),
            id: 'submitForm',
            onDone: {
              target: 'submitted',
              actions: 'assignSubmissionResult'
            },
            onError: {
              target: 'fillingOutForm',
              actions: 'assignSubmissionError'
            }
          }
        },
        submitted: {
          on: {
            RESET: {
              target: 'fillingOutForm',
              actions: 'unsetSubmissionResult'
            }
          }
        }
      }
    },
    {
      actions: {
        unsetServerError: assign(({ context }) => {
          context.serverError = undefined;
          return context;
        }),

        unsetSubmissionResult: assign(({ context }) => {
          context.submissionResult = undefined;
          return context;
        }),

        assignSubmissionResult: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.submitForm') {
            return context;
          }
          context.submissionResult = event.output;
          return context;
        }),

        assignSubmissionError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.submitForm') {
            return context;
          }
          context.serverError = castDraft(event.error);
          return context;
        })
      }
    }
  );
}
