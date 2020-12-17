import { Machine, MachineOptions, sendParent } from "xstate";
import {
  Comment,
  LabwareLayoutFragment as LabwareLayout,
} from "../../../../types/graphql";
import { LayoutPlan } from "../../layout/layoutContext";
import { cloneDeep } from "@apollo/client/utilities";
import { LabwareTypeName } from "../../../../types/stan";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../layout/layoutMachine";
import {
  SectioningOutcomeContext,
  SectioningOutcomeEvent,
  SectioningOutcomeSchema,
  State,
} from "./sectioningOutcomeTypes";
import { commitConfirmation } from "./sectioningOutcomeEvents";

enum Actions {
  ASSIGN_ADDRESS_COMMENT = "assignAddressComment",
  ASSIGN_ALL_COMMENT = "assignAllComment",
  ASSIGN_LAYOUT_PLAN = "assignLayoutPlan",
  TOGGLE_CANCEL = "toggleCancel",
  COMMIT_CONFIRMATION = "commitConfirmation",
}

enum Guards {
  IS_TUBE = "isTube",
}

enum Services {
  LAYOUT_MACHINE = "layoutMachine",
}

/**
 * SectioningOutcome State Machine
 */
export const createSectioningOutcomeMachine = (
  comments: Array<Comment>,
  labware: LabwareLayout,
  layoutPlan: LayoutPlan
) =>
  Machine<
    SectioningOutcomeContext,
    SectioningOutcomeSchema,
    SectioningOutcomeEvent
  >(
    {
      id: "sectioningOutcome",
      initial: State.INIT,
      context: {
        comments,
        labware,
        originalLayoutPlan: layoutPlan,
        layoutPlan: cloneDeep(layoutPlan),
        addressToCommentMap: new Map(),
        cancelled: false,
        cancelledAddresses: [],
      },
      states: {
        [State.INIT]: {
          always: [
            {
              cond: Guards.IS_TUBE,
              target: State.CANCELLABLE_MODE,
            },
            {
              target: State.EDITABLE_MODE,
            },
          ],
        },
        [State.CANCELLABLE_MODE]: {
          on: {
            TOGGLE_CANCEL: {
              actions: [Actions.TOGGLE_CANCEL, Actions.COMMIT_CONFIRMATION],
            },
          },
        },
        [State.EDITABLE_MODE]: {
          on: {
            SET_COMMENT_FOR_ADDRESS: {
              actions: [
                Actions.ASSIGN_ADDRESS_COMMENT,
                Actions.COMMIT_CONFIRMATION,
              ],
            },
            SET_COMMENT_FOR_ALL: {
              actions: [
                Actions.ASSIGN_ALL_COMMENT,
                Actions.COMMIT_CONFIRMATION,
              ],
            },
            EDIT_LAYOUT: {
              target: State.EDITING_LAYOUT,
            },
          },
        },
        [State.EDITING_LAYOUT]: {
          invoke: {
            src: Services.LAYOUT_MACHINE,
            onDone: {
              target: State.EDITABLE_MODE,
              actions: [
                Actions.ASSIGN_LAYOUT_PLAN,
                Actions.COMMIT_CONFIRMATION,
              ],
            },
          },
        },
      },
    },
    machineOptions
  );

const machineOptions: Partial<MachineOptions<
  SectioningOutcomeContext,
  SectioningOutcomeEvent
>> = {
  actions: {
    /**
     * Assign a comment to a particular address
     */
    [Actions.ASSIGN_ADDRESS_COMMENT]: assign((ctx, e) => {
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
    [Actions.ASSIGN_ALL_COMMENT]: assign((ctx, e) => {
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
    [Actions.ASSIGN_LAYOUT_PLAN]: assign((ctx, e) => {
      if (e.type !== "done.invoke.layoutMachine" || !e.data) {
        return;
      }
      ctx.layoutPlan = e.data.layoutPlan;

      const unemptyAddresses = new Set(ctx.layoutPlan.plannedActions.keys());
      ctx.addressToCommentMap.forEach((_, key) => {
        if (!unemptyAddresses.has(key)) {
          ctx.addressToCommentMap.delete(key);
        }
      });
    }),

    /**
     * Toggles whether this labware was used or not
     */
    [Actions.TOGGLE_CANCEL]: assign((ctx, e) => {
      if (e.type !== "TOGGLE_CANCEL") {
        return;
      }
      ctx.cancelled = !ctx.cancelled;
    }),

    [Actions.COMMIT_CONFIRMATION]: sendParent((ctx) => commitConfirmation(ctx)),
  },
  activities: {},
  delays: {},
  guards: {
    [Guards.IS_TUBE]: (ctx) =>
      ctx.labware.labwareType.name === LabwareTypeName.TUBE,
  },
  services: {
    [Services.LAYOUT_MACHINE]: (ctx, _e) => {
      return createLayoutMachine(
        ctx.layoutPlan,
        ctx.originalLayoutPlan.plannedActions
      );
    },
  },
};
