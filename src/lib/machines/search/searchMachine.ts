import { MachineConfig, MachineOptions, send } from "xstate";
import { SearchContext, SearchSchema, SearchEvent } from "./searchMachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";
import * as searchService from "../../services/searchService";
import { castDraft } from "immer";

/**
 * Search Machine Options
 */
const machineOptions: Partial<MachineOptions<SearchContext, SearchEvent>> = {
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
  activities: {},
  delays: {},
  guards: {},
  services: {
    search: (ctx, e) => {
      if (e.type !== "FIND") {
        return Promise.reject();
      }
      return searchService.search(e.request);
    },
  },
};

/**
 * Search Machine Config
 */
export const machineConfig: MachineConfig<
  SearchContext,
  SearchSchema,
  SearchEvent
> = {
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
};

const createSearchMachine = createMachineBuilder<
  SearchContext,
  SearchSchema,
  SearchEvent
>(machineConfig, machineOptions);

export default createSearchMachine;
