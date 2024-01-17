import { assign, createMachine, fromPromise } from 'xstate';
import { ServerErrors } from '../../../types/stan';
import { Maybe, RegisterResultFieldsFragment } from '../../../types/sdk';

export interface RegistrationContext<F, M> {
  registrationFormInput: Maybe<F>;
  buildRegistrationInput: (formInput: F, existingTissues?: Array<string>) => Promise<M>;
  registrationService: (mutationInput: M) => Promise<RegisterResultFieldsFragment>;
  registrationResult: Maybe<RegisterResultFieldsFragment>;
  registrationErrors: Maybe<ServerErrors>;
  confirmedTissues: Array<string>;
}

type SubmitFormEvent<F> = {
  type: 'SUBMIT_FORM';
  values: F;
};

type EditSubmissionEvent = {
  type: 'EDIT_SUBMISSION';
};

type SubmittingDoneEvent = {
  type: 'xstate.done.actor.submitting';
  output: RegisterResultFieldsFragment;
};

type SubmittingErrorEvent = {
  type: 'xstate.error.actor.submitting';
  error: unknown;
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
  buildRegistrationInput: (formInput: F, existingTissues?: Array<string>) => Promise<M>,
  registrationService: (mutationInput: M) => Promise<RegisterResultFieldsFragment>
) {
  return createMachine(
    {
      types: {} as {
        context: RegistrationContext<F, M>;
        events: RegistrationEvent<F>;
      },
      context: {
        registrationFormInput: null,
        buildRegistrationInput,
        registrationService,
        registrationResult: null,
        registrationErrors: null,
        confirmedTissues: []
      },
      id: 'registration',
      initial: 'ready',
      states: {
        ready: {
          entry: ['emptyConfirmedTissues'],
          on: {
            SUBMIT_FORM: 'submitting'
          }
        },
        submitting: {
          invoke: {
            id: 'submitting',
            src: fromPromise(({ input }) => {
              return buildRegistrationInput(input.values, input.confirmedTissues).then(input.registrationService);
            }),
            input: ({ context, event }) => ({
              values: (event as SubmitFormEvent<F>).values,
              registrationService: context.registrationService,
              confirmedTissues: context.confirmedTissues
            }),

            onDone: {
              target: 'checkSubmissionClashes',
              actions: ['assignRegistrationResult']
            },
            onError: {
              target: 'submissionError',
              actions: 'assignRegistrationError'
            }
          }
        },
        checkSubmissionClashes: {
          always: [
            {
              guard: 'isClash',
              target: 'clashed'
            },
            {
              target: 'complete'
            }
          ]
        },
        clashed: {
          on: {
            EDIT_SUBMISSION: 'ready',
            SUBMIT_FORM: 'submitting'
          }
        },
        submissionError: {
          on: {
            SUBMIT_FORM: 'submitting'
          }
        },
        complete: {
          type: 'final'
        }
      }
    },
    {
      actions: {
        emptyConfirmedTissues: assign(({ context }) => {
          context.confirmedTissues = [];
          return context;
        }),

        assignRegistrationResult: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.submitting' || !event.output) {
            return context;
          }
          context.registrationResult = event.output;

          // Store the clashed tissues to be used for possible user confirmation
          context.confirmedTissues = context.registrationResult.clashes.map((clash) => clash.tissue.externalName ?? '');
          return context;
        }),

        assignRegistrationError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.submitting') {
            return context;
          }
          context.registrationErrors = event.error as ServerErrors;
          return context;
        })
      },

      guards: {
        isClash: ({ context }) => context.registrationResult !== null && context.registrationResult.clashes.length > 0
      }
    }
  );
}
