import { assign, createMachine, fromPromise, raise } from 'xstate';
import { castDraft } from '../../../dependencies/immer';
import { SearchServiceInterface } from '../../services/searchServiceInterface';
import { SearchResultsType, ServerErrors } from '../../../types/stan';

/**
 * Context for Search Machine
 */
export interface SearchContext<E, T> {
  findRequest: E;
  maxRecords?: number;
  searchResult?: SearchResultsType<T>;
  serverError?: ServerErrors | null;
}

type FindEvent<E> = { type: 'FIND'; request: E };
type SearchDoneEvent<T> = {
  type: 'xstate.done.actor.search';
  output: SearchResultsType<T>;
};
type SearchErrorEvent = { type: 'xstate.error.actor.search'; error: ServerErrors };

export type SearchEvent = SearchErrorEvent;

/**
 * Search Machine Config
 */
function searchMachine<E, T>(searchService: SearchServiceInterface<E, T>, context: SearchContext<E, T>) {
  return createMachine(
    {
      types: {} as {
        context: SearchContext<E, T>;
        events: SearchEvent | SearchDoneEvent<T> | FindEvent<E>;
      },
      id: 'searchMachine',
      initial: 'unknown',
      context,
      states: {
        unknown: {
          always: [
            {
              guard: ({ context }) => {
                return Object.values(context?.findRequest ?? {}).some((v) => !!v);
              },
              target: 'ready',
              actions: raise({ type: 'FIND', request: context.findRequest })
            },
            { target: 'ready' }
          ]
        },
        ready: {
          on: {
            FIND: 'searching'
          }
        },
        searching: {
          entry: 'unassignServerError',
          invoke: {
            id: 'search',
            src: fromPromise(({ input }) => {
              return searchService.search({
                ...input.request,
                maxRecords: input.maxRecords
              });
            }),
            input: ({ context: { maxRecords }, event }) => ({ maxRecords, request: (event as FindEvent<E>).request }),
            onDone: {
              target: 'searched',
              actions: ({ context, event }) => {
                context.searchResult = castDraft(event.output);
              }
            },
            onError: {
              target: 'ready',
              actions: ({ context, event }) => {
                context.serverError = castDraft(event.error) as ServerErrors;
              }
            }
          }
        },
        searched: {
          on: {
            FIND: 'searching'
          }
        }
      }
    },
    {
      actions: {
        unassignServerError: assign(({ context }) => {
          context.serverError = null;
          return context;
        })
      }
    }
  );
}
export default searchMachine;
