import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import { Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { castDraft } from "immer";
import { WorkProgressUrlParams } from "../../pages/WorkProgress";

export type WorkProgressInputContext = {
  /**
   * The initial WorkProgressInput
   */
  workProgressInput: WorkProgressUrlParams;
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
      initial: "ready",
      states: {
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
          ctx.workProgressInput.filterType = e.value;
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
    }
  );
}
