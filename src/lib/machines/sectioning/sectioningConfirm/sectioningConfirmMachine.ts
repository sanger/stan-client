import { createMachine } from "xstate";
import {
  Comment,
  ConfirmOperationLabware,
  ConfirmSection,
  ConfirmSectionLabware,
  Maybe,
} from "../../../../types/sdk";
import { LayoutPlan, Source } from "../../layout/layoutContext";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../layout/layoutMachine";
import { cloneDeep } from "lodash";
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

  confirmSectionLabware: Maybe<ConfirmSectionLabware>;
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

type UpdateSectionNumberEvent = {
  type: "UPDATE_SECTION_NUMBER";
  slotAddress: string;
  sectionIndex: number;
  sectionNumber: number;
};

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
  | UpdateSectionNumberEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent;

function buildConfirmSection(
  destinationAddress: string,
  plannedAction: Source
): ConfirmSection {
  return {
    destinationAddress,
    newSection: plannedAction.newSection,
    sampleId: plannedAction.sampleId,
  };
}

function buildConfirmSections(
  destinationAddress: string,
  plannedActions: Array<Source>
): Array<ConfirmSection> {
  return plannedActions.map((action) =>
    buildConfirmSection(destinationAddress, action)
  );
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
        confirmSectionLabware: null,
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
            UPDATE_SECTION_NUMBER: {
              actions: ["updateSectionNumber", "commitConfirmation"],
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
            UPDATE_SECTION_NUMBER: {
              actions: ["updateSectionNumber", "commitConfirmation"],
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

        updateSectionNumber: assign((ctx, e) => {
          if (e.type !== "UPDATE_SECTION_NUMBER") {
            return;
          }

          const plannedAction = ctx.layoutPlan.plannedActions.get(
            e.slotAddress
          );

          if (plannedAction && plannedAction[e.sectionIndex]) {
            plannedAction[e.sectionIndex].newSection = e.sectionNumber;
          }
        }),

        commitConfirmation: assign((ctx) => {
          const confirmSections: Array<ConfirmSection> = [];

          for (let [
            destinationAddress,
            originalPlannedActions,
          ] of ctx.layoutPlan.plannedActions.entries()) {
            confirmSections.push(
              ...buildConfirmSections(
                destinationAddress,
                originalPlannedActions
              )
            );
          }

          ctx.confirmSectionLabware = {
            barcode: ctx.labware.barcode!,
            cancelled: ctx.cancelled,
            confirmSections,
            addressComments: Array.from(
              ctx.addressToCommentMap.entries()
            ).map(([address, commentId]) => ({ address, commentId })),
          };

          console.log(ctx.confirmSectionLabware);
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
