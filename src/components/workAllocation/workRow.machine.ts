import { createMachine } from "xstate";
import {
  WorkFieldsFragment,
  WorkStatus,
  UpdateWorkStatusMutation,
} from "../../types/sdk";
import { MachineServiceDone } from "../../types/stan";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";

type WorkRowMachineContext = {
  /**
   * Work...
   */
  work: WorkFieldsFragment;

  /**
   * Is the user currently editing the Work status?
   */
  editModeEnabled: boolean;
};

export type WorkRowEvent =
  | { type: "EDIT" }
  | { type: "PAUSE"; commentId: number }
  | { type: "COMPLETE"; commentId: undefined }
  | { type: "FAIL"; commentId: number }
  | { type: "REACTIVATE"; commentId: undefined }
  | MachineServiceDone<"updateWorkStatus", UpdateWorkStatusMutation>;

type CreateWorkRowMachineParams = {
  work: WorkFieldsFragment;
};

export default function createWorkRowMachine({
  work,
}: CreateWorkRowMachineParams) {
  return createMachine<WorkRowMachineContext, WorkRowEvent>(
    {
      id: "workRowMachine",
      context: {
        work,
        editModeEnabled: false,
      },
      initial: "deciding",
      states: {
        deciding: {
          always: [
            maybeGoToStatus("active"),
            maybeGoToStatus("paused"),
            maybeGoToStatus("completed"),
            maybeGoToStatus("failed"),
          ],
        },
        active: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            PAUSE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
          },
        },
        paused: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            REACTIVATE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
          },
        },
        completed: {},
        failed: {},
        updating: {
          invoke: {
            src: "updateWorkStatus",
            onDone: {
              actions: ["assignSgpNumber", "toggleEditMode"],
              target: "deciding",
            },
            onError: { target: "deciding" },
          },
        },
      },
    },
    {
      actions: {
        assignSgpNumber: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkStatus") return;
          ctx.work = e.data.updateWorkStatus;
        }),

        toggleEditMode: assign(
          (ctx) => (ctx.editModeEnabled = !ctx.editModeEnabled)
        ),
      },

      services: {
        updateWorkStatus: (ctx, e) => {
          return stanCore.UpdateWorkStatus({
            workNumber: ctx.work.workNumber,
            status: getWorkStatusFromEventType(e),
            commentId: "commentId" in e ? e.commentId : undefined,
          });
        },
      },
    }
  );
}

/**
 * Determine the next {@link WorkStatus} from a given event
 * @param e an {@link WorkRowEvent}
 */
function getWorkStatusFromEventType(e: WorkRowEvent): WorkStatus {
  switch (e.type) {
    case "COMPLETE":
      return WorkStatus.Completed;
    case "FAIL":
      return WorkStatus.Failed;
    case "PAUSE":
      return WorkStatus.Paused;
    case "REACTIVATE":
      return WorkStatus.Active;
  }

  throw new Error(`Can not determine next WorkStatus from event ${e.type}`);
}

/**
 * Action creator for determining which state to go to next, based on some Work's status
 * @param status the status to check
 */
function maybeGoToStatus(status: string) {
  return {
    target: status,
    cond: (ctx: WorkRowMachineContext) =>
      ctx.work.status.toLowerCase() === status.toLowerCase(),
  };
}
