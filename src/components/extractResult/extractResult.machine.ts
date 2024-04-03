import { ExtractResultQuery, PassFail } from '../../types/sdk';
import { assign, createMachine, fromPromise } from 'xstate';
import { stanCore } from '../../lib/sdk';
import { castDraft } from '../../dependencies/immer';
import { ServerErrors } from '../../types/stan';

export interface ExtractResultContext {
  extractResults: ExtractResultQuery[];
  serverError?: ServerErrors;
  scanErrorMessage?: string;
  currentBarcode: string;
}

type SubmitBarcodeEvent = {
  type: 'SUBMIT_BARCODE';
  barcode: string;
};
type UpdateBarcodeEvent = {
  type: 'UPDATE_BARCODE';
  barcode: string;
};
type ExtractResultSuccess = {
  type: 'xstate.done.actor.extractResult';
  output: ExtractResultQuery;
};
type ExtractResultFailure = {
  type: 'xstate.error.actor.extractResult';
  error: ServerErrors;
};
type RemoveExtractResultEvent = {
  type: 'REMOVE_EXTRACT_RESULT';
  barcode: string;
};

export type RNAAnalysisEvent =
  | SubmitBarcodeEvent
  | UpdateBarcodeEvent
  | ExtractResultSuccess
  | ExtractResultFailure
  | RemoveExtractResultEvent;

export const extractResultMachine = (initExtractedResults: ExtractResultQuery[]) =>
  createMachine(
    {
      id: 'extract_result',
      types: {} as {
        context: ExtractResultContext;
        events: RNAAnalysisEvent;
      },
      context: {
        extractResults: initExtractedResults ?? [],
        currentBarcode: ''
      },
      initial: 'ready',
      states: {
        ready: {
          on: {
            SUBMIT_BARCODE: [
              {
                target: 'submitBarcodeSuccess',
                actions: 'assignBarcode',
                guard: 'SubmitBarcodeValid'
              },
              {
                target: 'submitBarcodeFailed',
                guard: 'SubmitBarcodeInvalid'
              }
            ],
            UPDATE_BARCODE: {
              actions: ['unassignErrorMessage', 'assignBarcode']
            },
            REMOVE_EXTRACT_RESULT: {
              guard: 'ExtractResultNotEmpty',
              actions: 'removeExtractResult'
            }
          }
        },
        submitBarcodeSuccess: {
          entry: ['unassignServerError', 'unassignErrorMessage'],
          invoke: {
            id: 'extractResult',
            src: fromPromise(({ input }) => {
              return stanCore.ExtractResult({
                barcode: input.barcode
              });
            }),
            input: ({ context }) => ({ barcode: context.currentBarcode }),
            onDone: {
              target: 'extractResultSuccess',
              actions: 'assignExtractResult'
            },
            onError: {
              target: 'extractResultFailed',
              actions: 'assignServerError'
            }
          }
        },
        submitBarcodeFailed: {
          entry: 'assignSubmitBarcodeError',
          always: {
            actions: 'assignBarcode',
            target: 'ready'
          }
        },
        extractResultSuccess: {
          always: {
            target: 'ready'
          }
        },
        extractResultFailed: {
          always: {
            target: 'ready'
          }
        }
      }
    },
    {
      actions: {
        assignBarcode: assign(({ context, event, self }) => {
          if (!(event.type === 'UPDATE_BARCODE' || event.type === 'SUBMIT_BARCODE')) return context;
          return { ...context, currentBarcode: event.barcode };
        }),
        assignSubmitBarcodeError: assign(({ context, event }) => {
          if (event.type !== 'SUBMIT_BARCODE') return context;
          return { ...context, scanErrorMessage: `"${event.barcode}" has already been scanned` };
        }),
        assignExtractResult: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.extractResult') return context;
          if (!event.output.extractResult) {
            return { ...context, scanErrorMessage: `No extraction recorded for the tube ${context.currentBarcode}` };
          }
          if (!event.output.extractResult.result) {
            return {
              ...context,
              scanErrorMessage: `No result recorded for extraction of the tube ${context.currentBarcode}`
            };
          }

          if (event.output.extractResult.result === PassFail.Fail) {
            return {
              ...context,
              scanErrorMessage: `Extraction result is 'FAIL' for the tube ${context.currentBarcode}`
            };
          }
          return { ...context, extractResults: [...context.extractResults, event.output], currentBarcode: '' };
        }),
        removeExtractResult: assign(({ context, event }) => {
          if (event.type !== 'REMOVE_EXTRACT_RESULT') return context;
          const extractResults = context.extractResults.filter(
            (res) => res.extractResult.labware.barcode !== event.barcode
          );
          return { ...context, extractResults };
        }),
        assignServerError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.extractResult') return context;
          return { ...context, serverError: castDraft(event.error) };
        }),
        unassignServerError: assign(({ context }) => {
          return { ...context, serverError: undefined };
        }),
        unassignErrorMessage: assign(({ context }) => {
          return { ...context, scanErrorMessage: '' };
        })
      },

      guards: {
        SubmitBarcodeValid: ({ context }) => {
          return (
            context.extractResults.filter((result) => result.extractResult.labware.barcode === context.currentBarcode)
              .length <= 0
          );
        },
        SubmitBarcodeInvalid: ({ context, event }) => {
          return (
            context.extractResults.filter((result) => result.extractResult.labware.barcode === context.currentBarcode)
              .length > 0
          );
        },
        ExtractResultNotEmpty: ({ context, event }) => context.extractResults && context.extractResults.length > 0
      }
    }
  );
