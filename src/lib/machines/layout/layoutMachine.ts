import { Machine } from "xstate";
import { LayoutContext, LayoutPlan } from "./layoutContext";
import { LayoutSchema, State } from "./layoutStates";
import { LayoutEvents } from "./layoutEvents";
import {
  Actions,
  layoutMachineKey,
  machineOptions,
} from "./layoutMachineOptions";

export const createLayoutMachine = (
  layoutPlan: LayoutPlan,
  possibleActions?: LayoutPlan["plannedActions"]
) => {
  return Machine<LayoutContext, LayoutSchema, LayoutEvents>(
    {
      key: layoutMachineKey,
      initial: State.INIT,
      context: {
        layoutPlan,
        possibleActions,
        selected: null,
      },
      on: {
        DONE: {
          target: State.DONE,
        },
        CANCEL: {
          target: State.CANCELLED,
        },
      },
      states: {
        [State.INIT]: {
          always: [
            {
              cond: (ctx) => ctx.layoutPlan.sources.length > 0,
              target: State.SOURCE_DEST_MODE,
            },
            {
              target: State.DEST_ONLY_MODE,
            },
          ],
        },
        [State.SOURCE_DEST_MODE]: {
          initial: State.SOURCE_NOT_SELECTED,
          states: {
            [State.SOURCE_NOT_SELECTED]: {
              on: {
                SELECT_DESTINATION: {
                  actions: Actions.REMOVE_PLANNED_ACTION,
                },
              },
            },
            [State.SOURCE_SELECTED]: {
              on: {
                SELECT_DESTINATION: {
                  actions: Actions.ASSIGN_DESTINATION,
                },
              },
            },
          },
          on: {
            SELECT_SOURCE: {
              target: `${State.SOURCE_DEST_MODE}.${State.SOURCE_SELECTED}`,
              actions: Actions.ASSIGN_SELECTED,
            },

            SET_ALL_DESTINATIONS: {
              actions: Actions.ASSIGN_DESTINATION_ACTIONS,
            },
          },
        },
        [State.DEST_ONLY_MODE]: {
          on: {
            SELECT_DESTINATION: {
              actions: Actions.ADD_SECTION,
            },
            REMOVE_SECTION: {
              actions: Actions.REMOVE_SECTION,
            },
          },
        },
        [State.DONE]: {
          type: "final",
          data: {
            layoutPlan: (ctx: LayoutContext) => ctx.layoutPlan,
          },
        },
        [State.CANCELLED]: {
          type: "final",
        },
      },
    },
    machineOptions
  );
};
