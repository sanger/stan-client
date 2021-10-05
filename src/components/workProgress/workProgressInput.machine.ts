import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import { stanCore } from "../../lib/sdk";
import { Maybe, WorkStatus } from "../../types/sdk";
import { ClientError } from "graphql-request";
import {
  WorkProgressInputData,
  WorkProgressInputTypeField,
} from "./WorkProgressInput";
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

type SelectWorkNumberEvent = {
  type: "WORK_NUMBER_SELECTION";
};
type SelectWorkTypeEvent = {
  type: "WORK_TYPE_SELECTION";
};

type InitializeEvent = {
  type: "xstate.init";
};
type LoadWorkTypeDoneEvent = {
  type: "done.invoke.loadWorkTypes";
  data: string[];
};
type SelectStatusEvent = {
  type: "STATUS_SELECTION";
};
type SelectValueEvent = {
  type: "VALUE_SELECTION";
  value: string;
};
type ErrorEvent = {
  type: "error.platform.worktype";
  data: ClientError;
};

type WorkProgressInputEvent =
  | InitializeEvent
  | SelectWorkNumberEvent
  | SelectWorkTypeEvent
  | SelectStatusEvent
  | SelectValueEvent
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
            WORK_NUMBER_SELECTION: {
              actions: "assignWorkNumber",
            },
            WORK_TYPE_SELECTION: { actions: "assignWorkType" },
            STATUS_SELECTION: {
              actions: "assignStatus",
            },
            VALUE_SELECTION: {
              actions: "assignValue",
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
          //if a type is already selected on initializing (query parameters), load corresponding values for that type
          if (ctx.workProgressInput) {
            if (
              ctx.workProgressInput.selectedType ===
              WorkProgressInputTypeField.WorkType
            )
              ctx.workProgressInput.values = ctx.workTypes;
            else if (
              ctx.workProgressInput.selectedType ===
              WorkProgressInputTypeField.Status
            )
              ctx.workProgressInput.values = Object.values(WorkStatus);
          }
        }),
        assignWorkNumber: assign((ctx, e) => {
          if (e.type !== "WORK_NUMBER_SELECTION") return;
          ctx.workProgressInput.selectedType =
            WorkProgressInputTypeField.WorkNumber;
          ctx.workProgressInput.selectedValue = "";
        }),
        assignWorkType: assign((ctx, e) => {
          if (e.type !== "WORK_TYPE_SELECTION" && !ctx.workTypes) return;
          ctx.workProgressInput.selectedType =
            WorkProgressInputTypeField.WorkType;
          if (ctx.workTypes && ctx.workTypes.length > 0) {
            ctx.workProgressInput.values = ctx.workTypes;
            ctx.workProgressInput.selectedValue = ctx.workTypes[0];
          }
        }),
        assignStatus: assign((ctx, e) => {
          if (e.type !== "STATUS_SELECTION") return;
          ctx.workProgressInput.selectedType =
            WorkProgressInputTypeField.Status;
          const statusArr = Object.values(WorkStatus);
          ctx.workProgressInput.values = statusArr;
          ctx.workProgressInput.selectedValue = statusArr[0];
        }),
        assignValue: assign((ctx, e) => {
          if (e.type !== "VALUE_SELECTION") return;
          ctx.workProgressInput.selectedValue = e.value;
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
