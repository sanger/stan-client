import { createMachine } from "xstate";
import { Maybe } from "../../types/sdk";
import {
  HistoryProps,
  HistoryTableEntry,
  MachineServiceDone,
  MachineServiceError,
} from "../../types/stan";
import * as historyService from "../../lib/services/historyService";
import { assign } from "@xstate/immer";
import { ClientError } from "graphql-request";

type HistoryContext = {
  historyProps: HistoryProps;
  history: Array<HistoryTableEntry>;
  serverError: Maybe<ClientError>;
};

type HistoryEvent =
  | { type: "UPDATE_HISTORY_PROPS"; props: HistoryProps }
  | { type: "RETRY" }
  | MachineServiceDone<"findHistory", Array<HistoryTableEntry>>
  | MachineServiceError<"findHistory">;

export default function createHistoryMachine(
  initialHistoryProps: HistoryProps
) {
  return createMachine<HistoryContext, HistoryEvent>(
    {
      id: "historyMachine",
      initial: "searching",
      context: {
        historyProps: initialHistoryProps,
        history: [],
        serverError: null,
      },
      states: {
        searching: {
          invoke: {
            src: "findHistory",
            onDone: {
              target: "found",
              actions: "assignHistory",
            },
            onError: {
              target: "error",
              actions: "assignServerError",
            },
          },
        },
        found: {
          on: {
            UPDATE_HISTORY_PROPS: {
              target: "searching",
              actions: "assignHistoryProps",
            },
          },
        },
        error: {
          on: {
            RETRY: "searching",
            UPDATE_HISTORY_PROPS: {
              target: "searching",
              actions: "assignHistoryProps",
            },
          },
        },
      },
    },
    {
      actions: {
        assignHistory: assign((ctx, e) => {
          if (e.type !== "done.invoke.findHistory") return;
          ctx.history = e.data;
        }),

        assignHistoryProps: assign((ctx, e) => {
          if (e.type !== "UPDATE_HISTORY_PROPS") return;
          ctx.historyProps = e.props;
        }),

        assignServerError: assign((ctx, e) => {
          if (e.type !== "error.platform.findHistory") return;
          ctx.serverError = e.data;
        }),
      },
      services: {
        findHistory: (context) => {
          return historyService.findHistory(context.historyProps);
        },
      },
    }
  );
}
