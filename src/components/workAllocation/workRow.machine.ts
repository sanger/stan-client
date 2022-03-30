import { createMachine } from "xstate";
import {
  UpdateWorkNumBlocksMutation,
  UpdateWorkNumSlidesMutation,
  UpdateWorkPriorityMutation,
  UpdateWorkStatusMutation,
  WorkStatus,
  WorkWithCommentFieldsFragment,
} from "../../types/sdk";
import { MachineServiceDone } from "../../types/stan";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";

type WorkRowMachineContext = {
  /**
   * Work with possible comment
   */
  workWithComment: WorkWithCommentFieldsFragment;

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
  | { type: "WITHDRAW"; commentId: number }
  | { type: "REACTIVATE"; commentId: undefined }
  | { type: "ACTIVE"; commentId: undefined }
  | { type: "UPDATE_NUM_BLOCKS"; numBlocks: number | undefined }
  | { type: "UPDATE_NUM_SLIDES"; numSlides: number | undefined }
  | { type: "UPDATE_PRIORITY"; priority: string | undefined }
  | MachineServiceDone<"updateWorkStatus", UpdateWorkStatusMutation>
  | MachineServiceDone<"updateWorkNumBlocks", UpdateWorkNumBlocksMutation>
  | MachineServiceDone<"updateWorkNumSlides", UpdateWorkNumSlidesMutation>
  | MachineServiceDone<"updateWorkPriority", UpdateWorkPriorityMutation>;

type CreateWorkRowMachineParams = Pick<
  WorkRowMachineContext,
  "workWithComment"
>;

export default function createWorkRowMachine({
  workWithComment,
}: CreateWorkRowMachineParams) {
  return createMachine<WorkRowMachineContext, WorkRowEvent>(
    {
      id: "workRowMachine",
      context: {
        workWithComment,
        editModeEnabled: false,
      },
      initial: "deciding",
      states: {
        deciding: {
          always: [
            maybeGoToStatus("unstarted"),
            maybeGoToStatus("active"),
            maybeGoToStatus("paused"),
            maybeGoToStatus("completed"),
            maybeGoToStatus("failed"),
            maybeGoToStatus("withdrawn"),
          ],
        },
        unstarted: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            ACTIVE: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
            UPDATE_PRIORITY: "editPriority",
          },
        },
        active: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            PAUSE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
            WITHDRAW: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
            UPDATE_PRIORITY: "editPriority",
          },
        },
        paused: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            REACTIVATE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
            WITHDRAW: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
            UPDATE_PRIORITY: "editPriority",
          },
        },
        completed: {},
        failed: {},
        withdrawn: {},
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
        editNumberBlocks: {
          invoke: {
            src: "updateWorkNumBlocks",
            onDone: {
              actions: "assignWorkNumBlocks",
              target: "deciding",
            },
            onError: { target: "deciding" },
          },
        },
        editNumberSlides: {
          invoke: {
            src: "updateWorkNumSlides",
            onDone: {
              actions: "assignWorkNumSlides",
              target: "deciding",
            },
            onError: { target: "deciding" },
          },
        },
        editPriority: {
          invoke: {
            src: "updateWorkPriority",
            onDone: {
              actions: "assignWorkPriority",
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
          ctx.workWithComment = e.data.updateWorkStatus;
        }),
        assignWorkNumBlocks: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkNumBlocks") return;
          ctx.workWithComment.work = e.data.updateWorkNumBlocks;
        }),
        assignWorkNumSlides: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkNumSlides") return;
          ctx.workWithComment.work = e.data.updateWorkNumSlides;
        }),
        assignWorkPriority: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkPriority") return;
          ctx.workWithComment.work = e.data.updateWorkPriority;
        }),
        toggleEditMode: assign(
          (ctx) => (ctx.editModeEnabled = !ctx.editModeEnabled)
        ),
      },

      services: {
        updateWorkStatus: (ctx, e) => {
          return stanCore.UpdateWorkStatus({
            workNumber: ctx.workWithComment.work.workNumber,
            status: getWorkStatusFromEventType(e),
            commentId: "commentId" in e ? e.commentId : undefined,
          });
        },
        updateWorkNumBlocks: (ctx, e) => {
          let params: { workNumber: string; numBlocks?: number } = {
            workNumber: ctx.workWithComment.work.workNumber,
          };
          if ("numBlocks" in e && e.numBlocks)
            params["numBlocks"] = e.numBlocks;

          return stanCore.UpdateWorkNumBlocks(params);
        },
        updateWorkNumSlides: (ctx, e) => {
          let params: { workNumber: string; numSlides?: number } = {
            workNumber: ctx.workWithComment.work.workNumber,
          };
          if ("numSlides" in e && e.numSlides)
            params["numSlides"] = e.numSlides;

          return stanCore.UpdateWorkNumSlides(params);
        },
        updateWorkPriority: (ctx, e) => {
          let params: { workNumber: string; priority?: string } = {
            workNumber: ctx.workWithComment.work.workNumber,
          };
          if ("priority" in e && e.priority) params["priority"] = e.priority;
          return stanCore.UpdateWorkPriority(params);
        },
      },
    }
  );
}

/**
 * Determine the next {@link WorkStatus} from a given event
 * @param e a {@link WorkRowEvent}
 */
function getWorkStatusFromEventType(e: WorkRowEvent): WorkStatus {
  switch (e.type) {
    case "COMPLETE":
      return WorkStatus.Completed;
    case "FAIL":
      return WorkStatus.Failed;
    case "WITHDRAW":
      return WorkStatus.Withdrawn;
    case "PAUSE":
      return WorkStatus.Paused;
    case "REACTIVATE":
      return WorkStatus.Active;
    case "ACTIVE":
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
      ctx.workWithComment.work.status.toLowerCase() === status.toLowerCase(),
  };
}
