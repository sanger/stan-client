import { createMachine } from "xstate";
import {
  SasNumberFieldsFragment,
  SasStatus,
  UpdateSasNumberStatusMutation,
} from "../../types/sdk";
import { MachineServiceDone } from "../../types/stan";
import { stanCore } from "../../lib/sdk";
import { assign } from "@xstate/immer";

type SasRowMachineContext = {
  /**
   * An SAS number
   */
  sasNumber: SasNumberFieldsFragment;

  /**
   * Is the user currently editing the SAS status?
   */
  editModeEnabled: boolean;
};

export type SasRowEvent =
  | { type: "EDIT" }
  | { type: "PAUSE"; commentId: number }
  | { type: "COMPLETE"; commentId: undefined }
  | { type: "FAIL"; commentId: number }
  | { type: "REACTIVATE"; commentId: undefined }
  | MachineServiceDone<"updateSasNumberStatus", UpdateSasNumberStatusMutation>;

type CreateSasRowMachineParams = {
  sasNumber: SasNumberFieldsFragment;
};

export default function createSasRowMachine({
  sasNumber,
}: CreateSasRowMachineParams) {
  return createMachine<SasRowMachineContext, SasRowEvent>(
    {
      id: "sasRowMachine",
      context: {
        sasNumber,
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
            src: "updateSasNumberStatus",
            onDone: {
              actions: ["assignSasNumber", "toggleEditMode"],
              target: "deciding",
            },
            onError: { target: "deciding" },
          },
        },
      },
    },
    {
      actions: {
        assignSasNumber: assign((ctx, e) => {
          if (e.type !== "done.invoke.updateSasNumberStatus") return;
          ctx.sasNumber = e.data.updateSasNumberStatus;
        }),

        toggleEditMode: assign(
          (ctx) => (ctx.editModeEnabled = !ctx.editModeEnabled)
        ),
      },

      services: {
        updateSasNumberStatus: (ctx, e) => {
          return stanCore.UpdateSasNumberStatus({
            sasNumber: ctx.sasNumber.sasNumber,
            status: getSasStatusFromEventType(e),
            commentId: "commentId" in e ? e.commentId : undefined,
          });
        },
      },
    }
  );
}

/**
 * Determine the next {@link SasStatus} from a given event
 * @param e an {@link SasRowEvent}
 */
function getSasStatusFromEventType(e: SasRowEvent): SasStatus {
  switch (e.type) {
    case "COMPLETE":
      return SasStatus.Completed;
    case "FAIL":
      return SasStatus.Failed;
    case "PAUSE":
      return SasStatus.Paused;
    case "REACTIVATE":
      return SasStatus.Active;
  }

  throw new Error(`Can not determine next SasStatus from event ${e.type}`);
}

/**
 * Action creator for determining which state to go to next, based on an SAS number's status
 * @param status the status to check
 */
function maybeGoToStatus(status: string) {
  return {
    target: status,
    cond: (ctx: SasRowMachineContext) =>
      ctx.sasNumber.status.toLowerCase() === status.toLowerCase(),
  };
}
