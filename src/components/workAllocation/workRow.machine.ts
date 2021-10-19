import { createMachine } from "xstate";
import {
  WorkFieldsFragment,
  WorkStatus,
  UpdateWorkStatusMutation,
  UpdateWorkNumBlocksMutation,
  UpdateWorkNumSlidesMutation,
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
  | { type: "ACTIVE"; commentId: undefined }
  | { type: "UPDATE_NUM_BLOCKS"; numBlocks: number | undefined }
  | { type: "UPDATE_NUM_SLIDES"; numSlides: number | undefined }
  | MachineServiceDone<"updateWorkStatus", UpdateWorkStatusMutation>
  | MachineServiceDone<"updateWorkNumBlocks", UpdateWorkNumBlocksMutation>
  | MachineServiceDone<"updateWorkNumSlides", UpdateWorkNumSlidesMutation>;

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
            maybeGoToStatus("unstarted"),
            maybeGoToStatus("active"),
            maybeGoToStatus("paused"),
            maybeGoToStatus("completed"),
            maybeGoToStatus("failed"),
          ],
        },
        unstarted: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            ACTIVE: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
          },
        },
        active: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            PAUSE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
          },
        },
        paused: {
          on: {
            EDIT: { actions: "toggleEditMode" },
            REACTIVATE: "updating",
            COMPLETE: "updating",
            FAIL: "updating",
            UPDATE_NUM_BLOCKS: "editNumberBlocks",
            UPDATE_NUM_SLIDES: "editNumberSlides",
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
      },
    },
    {
      actions: {
        assignSgpNumber: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkStatus") return;
          ctx.work = e.data.updateWorkStatus;
        }),
        assignWorkNumBlocks: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkNumBlocks") return;
          ctx.work = e.data.updateWorkNumBlocks;
        }),
        assignWorkNumSlides: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateWorkNumSlides") return;
          ctx.work = e.data.updateWorkNumSlides;
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
        updateWorkNumBlocks: (ctx, e) => {
          let params: { workNumber: string; numBlocks?: number } = {
            workNumber: ctx.work.workNumber,
          };
          if ("numBlocks" in e && e.numBlocks)
            params["numBlocks"] = e.numBlocks;

          return stanCore.UpdateWorkNumBlocks(params);
        },
        updateWorkNumSlides: (ctx, e) => {
          let params: { workNumber: string; numSlides?: number } = {
            workNumber: ctx.work.workNumber,
          };
          if ("numSlides" in e && e.numSlides)
            params["numSlides"] = e.numSlides;

          return stanCore.UpdateWorkNumSlides(params);
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
      ctx.work.status.toLowerCase() === status.toLowerCase(),
  };
}
