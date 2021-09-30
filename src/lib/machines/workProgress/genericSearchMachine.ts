import { createMachine, send } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";
import { ClientError } from "graphql-request";
import { Maybe } from "../../../types/sdk";
import { GenericSearchService } from "../../services/genericSearchService";
/**
 * Context for Search Machine
 */
export interface SearchContext {
  findRequest: any;
  maxRecords?: number;
  searchResult?: any;
  serverError?: Maybe<ClientError>;
}

type FindEvent = { type: "FIND"; request: Object };
type SearchDoneEvent = {
  type: "done.invoke.search";
  data: Object;
};
type SearchErrorEvent = { type: "error.platform.search"; data: ClientError };

export type SearchEvent = FindEvent | SearchDoneEvent | SearchErrorEvent;

/**
 * Search Machine Config
 */
const genericSearchMachine = (searchService: GenericSearchService) => {
  return createMachine<SearchContext, SearchEvent>(
    {
      id: "search",
      initial: "unknown",
      states: {
        unknown: {
          always: [
            {
              cond: (context) =>
                Object.values(context.findRequest).some((v) => !!v),
              target: "ready",
              actions: send((ctx, _e) => ({
                type: "FIND",
                request: ctx.findRequest,
              })),
            },
            { target: "ready" },
          ],
        },
        ready: {
          on: {
            FIND: "searching",
          },
        },
        searching: {
          entry: "unassignServerError",
          invoke: {
            src: "search",
            onDone: {
              target: "searched",
              actions: "assignSearchResult",
            },
            onError: {
              target: "ready",
              actions: "assignServerError",
            },
          },
        },
        searched: {
          on: {
            FIND: "searching",
          },
        },
      },
    },
    {
      actions: {
        assignSearchResult: assign((ctx, e) => {
          if (e.type !== "done.invoke.search") {
            return;
          }
          ctx.searchResult = e.data;
        }),

        unassignServerError: assign((ctx, _e) => {
          ctx.serverError = null;
        }),

        assignServerError: assign((ctx, e) => {
          if (e.type !== "error.platform.search") {
            return;
          }
          ctx.serverError = castDraft(e.data);
        }),
      },
      services: {
        search: (ctx, e) => {
          if (e.type !== "FIND") {
            return Promise.reject();
          }
          return searchService.search({
            ...e.request,
            maxRecords: ctx.maxRecords,
          });
        },
      },
    }
  );
};
export default genericSearchMachine;
