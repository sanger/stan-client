import { assign, createMachine, fromPromise } from 'xstate';
import { DataFetcherContext, DataFetcherEvent, DataFetcherSchema } from './dataFetcherMachineTypes';

/**
 * DataFetcher Machine Config
 */

const defaultContext: DataFetcherContext = {
  dataFetcher: () => Promise.resolve(),
  data: undefined
};
export function createDataFetcherMachine(context = defaultContext) {
  return createMachine({
    id: 'dataFetcher',
    initial: 'loading',
    types: {} as {
      context: DataFetcherContext;
      events: DataFetcherEvent;
      schema: DataFetcherSchema;
    },
    context,
    states: {
      loading: {
        invoke: {
          src: fromPromise(({ input }) => input.dataFetcher()),
          input: ({ context }) => ({ dataFetcher: context.dataFetcher }),
          onDone: {
            target: 'done',
            actions: assign(({ context, event }) => {
              context.data = event.output;
              return context;
            })
          },
          onError: 'failed'
        }
      },
      failed: {
        on: {
          RETRY: 'loading'
        }
      },
      done: {
        type: 'final'
      }
    }
  });
}

export default createDataFetcherMachine;
