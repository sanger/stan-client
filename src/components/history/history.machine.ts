import { assign, createMachine, fromPromise } from 'xstate';
import { HistoryData } from '../../types/stan';
import * as historyService from '../../lib/services/historyService';
import { HistoryUrlParams } from '../../pages/History';
import { ClientError } from 'graphql-request';
import { Maybe } from 'yup';
import { HistoryService } from '../../lib/services/historyService';

type HistoryContext = {
  historyProps: HistoryUrlParams;
  history: HistoryData;
  serverError: Maybe<ClientError>;
  historyGraph?: string;
  historyGraphZoom: number;
  historyGraphFontSize: number;
};

type HistoryEvent =
  | { type: 'UPDATE_HISTORY_PROPS'; props: HistoryUrlParams }
  | { type: 'RETRY' }
  | { type: 'xstate.done.actor.findHistory'; output: HistoryService }
  | { type: 'xstate.error.actor.findHistory'; error: Maybe<ClientError> };

export default function createHistoryMachine() {
  return createMachine(
    {
      types: {} as {
        events: HistoryEvent;
        context: HistoryContext;
      },
      id: 'historyMachine',
      initial: 'searching',
      context: ({ input }: { input: HistoryContext }): HistoryContext => ({
        ...input,
        historyGraphZoom: input.historyGraphZoom || 1,
        historyGraph: input.historyGraph || '',
        historyGraphFontSize: input.historyGraphFontSize || 16
      }),
      states: {
        searching: {
          invoke: {
            id: 'findHistory',
            src: fromPromise(({ input }) => historyService.findHistory(input.historyProps)),
            input: ({ context: { historyProps, historyGraphZoom, historyGraphFontSize } }) => ({
              historyProps,
              zoom: historyGraphZoom,
              fontSize: historyGraphFontSize
            }),
            onDone: {
              target: 'found',
              actions: 'assignHistory'
            },
            onError: {
              target: 'error',
              actions: 'assignServerError'
            }
          }
        },
        found: {
          on: {
            UPDATE_HISTORY_PROPS: {
              target: 'searching',
              actions: 'assignHistoryProps'
            }
          }
        },
        error: {
          on: {
            RETRY: 'searching',
            UPDATE_HISTORY_PROPS: {
              target: 'searching',
              actions: 'assignHistoryProps'
            }
          }
        }
      }
    },
    {
      actions: {
        assignHistory: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.findHistory') return context;
          return {
            ...context,
            historyGraph: event.output.historyGraph,
            history: event.output.history,
            historyGraphZoom: event.output.zoom,
            historyGraphFontSize: event.output.fontSize
          };
        }),

        assignHistoryProps: assign(({ context, event }) => {
          if (event.type === 'UPDATE_HISTORY_PROPS') {
            return {
              ...context,
              historyProps: event.props || context.historyProps,
              historyGraphFontSize: event.props.fontSize || context.historyGraphFontSize,
              historyGraphZoom: event.props.zoom || context.historyGraphZoom
            };
          }
          return context;
        }),
        assignServerError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.findHistory') return context;
          return { ...context, serverError: event.error };
        })
      }
    }
  );
}
