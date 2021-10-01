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
};

type SelectWorkNumberEvent = {
  type: "WORK_NUMBER_SELECTION";
};
type SelectWorkTypeEvent = {
  type: "WORK_TYPE_SELECTION";
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
      initial: "ready",
      context: {
        workProgressInput,
      },
      states: {
        ready: {
          on: {
            WORK_NUMBER_SELECTION: {
              actions: "assignWorkNumber",
            },
            WORK_TYPE_SELECTION: "workTypeSelection",
            STATUS_SELECTION: {
              actions: "assignStatus",
            },
            VALUE_SELECTION: {
              actions: "assignValue",
            },
          },
        },
        workTypeSelection: {
          entry: "unassignServerError",
          invoke: {
            src: "loadWorkTypes",
            onDone: { actions: "assignWorkType", target: "ready" },
            onError: { target: "ready", actions: "assignServerError" },
          },
        },
      },
    },
    {
      actions: {
        assignWorkNumber: assign((ctx, e) => {
          if (e.type !== "WORK_NUMBER_SELECTION") return;
          ctx.workProgressInput.selectedType =
            WorkProgressInputTypeField.WorkNumber;
          ctx.workProgressInput.selectedValue = "";
        }),
        assignWorkType: assign((ctx, e) => {
          if (e.type !== "done.invoke.loadWorkTypes") return;
          ctx.workProgressInput.selectedType =
            WorkProgressInputTypeField.WorkType;
          ctx.workProgressInput.values = e.data;
          ctx.workProgressInput.selectedValue = e.data[0];
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
          if (e.type !== "WORK_TYPE_SELECTION") {
            return Promise.reject();
          }
          const response = await stanCore.GetWorkTypes();
          return response.workTypes.map((val) => val.name);
        },
      },
    }
  );
}
