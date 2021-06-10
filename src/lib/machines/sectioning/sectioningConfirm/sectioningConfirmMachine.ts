import { createMachine } from "xstate";
import {
  CancelPlanAction,
  Comment,
  ConfirmOperationLabware,
  Maybe,
} from "../../../../types/sdk";
import { LayoutPlan, Source } from "../../layout/layoutContext";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../layout/layoutMachine";
import { cloneDeep, find } from "lodash";
import { isTube } from "../../../helpers/labwareHelper";
import { Address, NewLabwareLayout } from "../../../../types/stan";

export interface SectioningConfirmContext {
  /**
   * The layout plan created in the plan stage
   */
  originalLayoutPlan: LayoutPlan;

  /**
   * The current layout (some sections may have not been done in the end)
   */
  layoutPlan: LayoutPlan;

  /**
   * The destination labware
   */
  labware: NewLabwareLayout;

  /**
   * All comments available for the outcome confirmation
   */
  comments: Array<Comment>;

  /**
   * Map of labware address to comment ID
   */
  addressToCommentMap: Map<Address, number>;

  /**
   * Has this labware been cancelled (relevant only for tubes)
   */
  cancelled: boolean;

  confirmOperationLabware: Maybe<ConfirmOperationLabware>;
}

type SetCommentForAddressEvent = {
  type: "SET_COMMENT_FOR_ADDRESS";
  address: string;
  commentId: string;
};

type SetCommentForAllEvent = {
  type: "SET_COMMENT_FOR_ALL";
  commentId: string;
};

type EditLayoutEvent = { type: "EDIT_LAYOUT" };
type CancelEditLayoutEvent = { type: "CANCEL_EDIT_LAYOUT" };
type DoneEditLayoutEvent = { type: "DONE_EDIT_LAYOUT" };

export type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

type ToggleCancelEvent = { type: "TOGGLE_CANCEL" };

export type CommitConfirmationEvent = {
  type: "COMMIT_CONFIRMATION";
  confirmOperationLabware: ConfirmOperationLabware;
};

export type SectioningConfirmationCompleteEvent = {
  type: "SECTIONING_CONFIRMATION_COMPLETE";
};

export type SectioningConfirmEvent =
  | SetCommentForAddressEvent
  | SetCommentForAllEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | LayoutMachineDone
  | ToggleCancelEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent;

function buildCancelPlanAction(
  destinationAddress: string,
  plannedAction: Source
): CancelPlanAction {
  return {
    destinationAddress,
    newSection: plannedAction.newSection,
    sampleId: plannedAction.sampleId,
  };
}

function buildCancelPlanActions(
  destinationAddress: string,
  plannedActions: Array<Source>
): Array<CancelPlanAction> {
  return plannedActions.map((action) =>
    buildCancelPlanAction(destinationAddress, action)
  );
}

export function sectioningConfirmationComplete(): SectioningConfirmEvent {
  return {
    type: "SECTIONING_CONFIRMATION_COMPLETE",
  };
}

/**
 * ConfirmLabware Machine
 */
export const createSectioningConfirmMachine = (
  comments: Array<Comment>,
  labware: NewLabwareLayout,
  layoutPlan: LayoutPlan
) =>
  createMachine<SectioningConfirmContext, SectioningConfirmEvent>(
    {
      id: "sectioningOutcome",
      initial: "init",
      context: {
        comments,
        labware,
        originalLayoutPlan: layoutPlan,
        layoutPlan: cloneDeep(layoutPlan),
        addressToCommentMap: new Map(),
        cancelled: false,
        confirmOperationLabware: null,
      },
      on: {
        SECTIONING_CONFIRMATION_COMPLETE: "done",
      },
      states: {
        init: {
          always: [
            {
              cond: "isTube",
              target: "cancellableMode",
            },
            {
              target: "editableMode",
            },
          ],
        },
        cancellableMode: {
          on: {
            TOGGLE_CANCEL: {
              actions: ["toggleCancel", "commitConfirmation"],
            },
          },
        },
        editableMode: {
          on: {
            SET_COMMENT_FOR_ADDRESS: {
              actions: ["assignAddressComment", "commitConfirmation"],
            },
            SET_COMMENT_FOR_ALL: {
              actions: ["assignAllComment", "commitConfirmation"],
            },
            EDIT_LAYOUT: {
              target: "editingLayout",
            },
          },
        },
        editingLayout: {
          invoke: {
            src: "layoutMachine",
            onDone: {
              target: "editableMode",
              actions: ["assignLayoutPlan", "commitConfirmation"],
            },
          },
        },
        done: {
          type: "final",
        },
      },
    },
    {
      actions: {
        /**
         * Assign a comment to a particular address
         */
        assignAddressComment: assign((ctx, e) => {
          if (e.type !== "SET_COMMENT_FOR_ADDRESS") {
            return;
          }

          if (e.commentId === "") {
            ctx.addressToCommentMap.delete(e.address);
          } else {
            ctx.addressToCommentMap.set(e.address, Number(e.commentId));
          }
        }),

        /**
         * Assign all the addresses with planned actions in the same comment
         */
        assignAllComment: assign((ctx, e) => {
          if (e.type !== "SET_COMMENT_FOR_ALL") {
            return;
          }
          if (e.commentId === "") {
            ctx.addressToCommentMap.clear();
          } else {
            ctx.layoutPlan.plannedActions.forEach((value, key) => {
              ctx.addressToCommentMap.set(key, Number(e.commentId));
            });
          }
        }),

        /**
         * Assign the layout plan that comes back from the layout machine.
         * If there are any comments for slots that have now been removed, removed the comment also
         */
        assignLayoutPlan: assign((ctx, e) => {
          if (e.type !== "done.invoke.layoutMachine" || !e.data) {
            return;
          }
          ctx.layoutPlan = e.data.layoutPlan;

          const unemptyAddresses = new Set(
            ctx.layoutPlan.plannedActions.keys()
          );
          ctx.addressToCommentMap.forEach((_, key) => {
            if (!unemptyAddresses.has(key)) {
              ctx.addressToCommentMap.delete(key);
            }
          });
        }),

        /**
         * Toggles whether this labware was used or not
         */
        toggleCancel: assign((ctx, e) => {
          if (e.type !== "TOGGLE_CANCEL") {
            return;
          }
          ctx.cancelled = !ctx.cancelled;
        }),

        commitConfirmation: assign((ctx) => {
          const cancelledActions: Array<CancelPlanAction> = [];
          const confirmPlannedActions = ctx.layoutPlan.plannedActions;

          for (let [
            destinationAddress,
            originalPlannedActions,
          ] of ctx.originalLayoutPlan.plannedActions.entries()) {
            const plannedActions =
              confirmPlannedActions.get(destinationAddress) ?? [];

            // Find all the original planned actions that are now missing after layout confirmation
            let missingOriginalActions: Array<Source> = originalPlannedActions.filter(
              (action) =>
                !find(plannedActions, {
                  sampleId: action.sampleId,
                  newSection: action.newSection,
                  address: action.address,
                })
            );

            cancelledActions.push(
              ...buildCancelPlanActions(
                destinationAddress,
                missingOriginalActions
              )
            );
          }

          ctx.confirmOperationLabware = {
            barcode: ctx.labware.barcode!,
            cancelled: ctx.cancelled,
            cancelledActions,
            addressComments: Array.from(
              ctx.addressToCommentMap.entries()
            ).map(([address, commentId]) => ({ address, commentId })),
          };

          console.log(ctx.confirmOperationLabware);
        }),
      },
      activities: {},
      delays: {},
      guards: {
        isTube: (ctx) => isTube(ctx.labware.labwareType),
      },
      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(
            ctx.layoutPlan,
            ctx.originalLayoutPlan.plannedActions
          );
        },
      },
    }
  );
