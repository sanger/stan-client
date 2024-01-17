import { assign, createMachine, fromPromise } from 'xstate';
import { HistoryTableEntry, ServerErrors } from '../../types/stan';
import * as historyService from '../../lib/services/historyService';
import { HistoryUrlParams } from '../../pages/History';

type HistoryContext = {
  historyProps: HistoryUrlParams;
  history: Array<HistoryTableEntry>;
  serverError: ServerErrors | null;
};

type HistoryEvent =
  | { type: 'UPDATE_HISTORY_PROPS'; props: HistoryUrlParams }
  | { type: 'RETRY' }
  | { type: 'xstate.done.actor.findHistory'; output: Array<HistoryTableEntry> }
  | { type: 'xstate.error.actor.findHistory'; error: ServerErrors };

const defaultMachineContext: HistoryContext = {
  historyProps: {},
  history: [],
  serverError: null
};

export default function createHistoryMachine(context = defaultMachineContext) {
  return createMachine(
    {
      types: {} as {
        events: HistoryEvent;
        context: HistoryContext;
      },
      id: 'historyMachine',
      initial: 'searching',
      context,
      states: {
        searching: {
          invoke: {
            id: 'findHistory',
            src: fromPromise(({ input }) => historyService.findHistory(input.historyProps)),
            input: ({ context: { historyProps } }) => ({ historyProps }),
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
          context.history = event.output;
          return context;
        }),

        assignHistoryProps: assign(({ context, event }) => {
          if (event.type === 'UPDATE_HISTORY_PROPS') context.historyProps = event.props;
          return context;
        }),

        assignServerError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.findHistory') return context;
          context.serverError = event.error;
          return context;
        })
      }
    }
  );
}
