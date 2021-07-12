import { createMachine, send } from "xstate";
import { assign } from "@xstate/immer";
import * as searchService from "../../services/searchService";
import { castDraft } from "immer";
import { FindRequest, Maybe } from "../../../types/sdk";
import { SearchResultsType } from "../../../types/stan";
import { ClientError } from "graphql-request";

/**
 * Context for Search Machine
 */
export interface SearchContext {
  findRequest: FindRequest;
  maxRecords: number;
  searchResult?: SearchResultsType;
  serverError?: Maybe<ClientError>;
}

type FindEvent = { type: "FIND"; request: FindRequest };
type SearchDoneEvent = {
  type: "done.invoke.search";
  data: SearchResultsType;
};
type SearchErrorEvent = { type: "error.platform.search"; data: ClientError };

export type SearchEvent = FindEvent | SearchDoneEvent | SearchErrorEvent;

/**
 * Search Machine Config
 */
const searchMachine = createMachine<SearchContext, SearchEvent>(
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

export default searchMachine;
