import { createMachine, send } from 'xstate';
import { assign } from '@xstate/immer';
import { castDraft } from 'immer';
import { ClientError } from 'graphql-request';
import { Maybe } from '../../../types/sdk';
import { SearchServiceInterface } from '../../services/searchServiceInterface';
import { SearchResultsType } from '../../../types/stan';

/**
 * Context for Search Machine
 */
export interface SearchContext<E, T> {
  findRequest: E;
  maxRecords?: number;
  searchResult?: SearchResultsType<T>;
  serverError?: Maybe<ClientError>;
}

type FindEvent<E> = { type: 'FIND'; request: E };
type SearchDoneEvent<T> = {
  type: 'done.invoke.search';
  data: SearchResultsType<T>;
};
type SearchErrorEvent = { type: 'error.platform.search'; data: ClientError };

export type SearchEvent = SearchErrorEvent;

/**
 * Search Machine Config
 */
function searchMachine<E, T>(searchService: SearchServiceInterface<E, T>) {
  return createMachine<SearchContext<E, T>, SearchEvent | FindEvent<E> | SearchDoneEvent<T>>(
    {
      id: 'searchMachine',
      initial: 'unknown',
      states: {
        unknown: {
          always: [
            {
              cond: (context) => Object.values(context.findRequest).some((v) => !!v),
              target: 'ready',
              actions: send((ctx, _e) => ({
                type: 'FIND',
                request: ctx.findRequest
              }))
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
            src: 'search',
            id: 'search',
            onDone: {
              target: 'searched',
              actions: 'assignSearchResult'
            },
            onError: {
              target: 'ready',
              actions: 'assignServerError'
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
        assignSearchResult: assign((ctx, e) => {
          if (e.type !== 'done.invoke.search') {
            return;
          }
          ctx.searchResult = castDraft(e.data as SearchResultsType<T>);
        }),

        unassignServerError: assign((ctx, _e) => {
          ctx.serverError = null;
        }),

        assignServerError: assign((ctx, e) => {
          if (e.type !== 'error.platform.search') {
            return;
          }
          ctx.serverError = castDraft(e.data);
        })
      },
      services: {
        search: (ctx, e) => {
          if (e.type !== 'FIND') {
            return Promise.reject();
          }
          return searchService.search({
            ...e.request,
            maxRecords: ctx.maxRecords
          });
        }
      }
    }
  );
}
export default searchMachine;
