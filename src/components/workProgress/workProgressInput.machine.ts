import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import { Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";
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
          ctx.workProgressInput.searchValues = e.value;
        }),
      },
    }
  );
}
