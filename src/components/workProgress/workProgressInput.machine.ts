import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import { stanCore } from "../../lib/sdk";
import { Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { WorkProgressInputData } from "./WorkProgressInput";
import { castDraft } from "immer";

export type WorkProgressInputContext = {
  /**
   * The initial WorkProgressInput
   */
  workProgressInput: WorkProgressInputData;
  /**
   * Error returned by server
   */
  serverError?: Maybe<ClientError>;
  workTypes?: string[];
};

type InitializeEvent = {
  type: "xstate.init";
};
type LoadWorkTypeDoneEvent = {
  type: "done.invoke.loadWorkTypes";
  data: string[];
};
type SetSearchTypeEvent = {
  type: "SET_SEARCH_TYPE";
  value: string;
};
type SetSearchValueEvent = {
  type: "SET_SEARCH_VALUE";
  value: string;
};
type SetFilterTypeEvent = {
  type: "SET_FILTER_TYPE";
  value: string;
};
type SetFilterValueEvent = {
  type: "SET_FILTER_VALUE";
  value: string[];
};

type ErrorEvent = {
  type: "error.platform.worktype";
  data: ClientError;
};

type WorkProgressInputEvent =
  | InitializeEvent
  | SetSearchTypeEvent
  | SetSearchValueEvent
  | SetFilterTypeEvent
  | SetFilterValueEvent
  | LoadWorkTypeDoneEvent
  | ErrorEvent;

export default function createWorkProgressInputMachine({
  workProgressInput,
}: WorkProgressInputContext) {
  return createMachine<WorkProgressInputContext, WorkProgressInputEvent>(
    {
      id: "workProgressMachine",
      context: {
        workProgressInput,
      },
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "loadWorkTypes",
            onDone: { actions: "initializeValueArray", target: "ready" },
            onError: { target: "ready", actions: "assignServerError" },
          },
        },

        ready: {
          on: {
            SET_SEARCH_TYPE: {
              actions: "assignSearchType",
            },
            SET_SEARCH_VALUE: {
              actions: "assignSearchValue",
            },
            SET_FILTER_TYPE: {
              actions: "assignFilterType",
            },
            SET_FILTER_VALUE: {
              actions: "assignFilterValue",
            },
          },
        },
      },
    },
    {
      actions: {
        initializeValueArray: assign((ctx, e) => {
          if (e.type !== "done.invoke.loadWorkTypes") return;
          //store all work types
          ctx.workTypes = e.data;
          debugger;
        }),
        assignSearchType: assign((ctx, e) => {
          if (e.type !== "SET_SEARCH_TYPE") return;
          ctx.workProgressInput.searchType = e.value;
        }),
        assignSearchValue: assign((ctx, e) => {
          if (e.type !== "SET_SEARCH_VALUE") return;
          ctx.workProgressInput.searchValue = e.value;
        }),

        assignFilterType: assign((ctx, e) => {
          if (e.type !== "SET_FILTER_TYPE") return;
          ctx.workProgressInput.filterType = e.type;
        }),
        assignFilterValue: assign((ctx, e) => {
          if (e.type !== "SET_FILTER_VALUE") return;
          ctx.workProgressInput.filterValues = e.value;
        }),
        unassignServerError: assign((ctx, _e) => {
          ctx.serverError = null;
        }),

        assignServerError: assign((ctx, e) => {
          if (e.type !== "error.platform.worktype") {
            return;
          }
          ctx.serverError = castDraft(e.data);
        }),
      },
      services: {
        loadWorkTypes: async (ctx, e) => {
          if (e.type !== "xstate.init") {
            return Promise.reject();
          }
          const response = await stanCore.GetWorkTypes();
          return response.workTypes.map((val) => val.name);
        },
      },
    }
  );
}
