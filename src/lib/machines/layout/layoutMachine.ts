import { Interpreter, Machine, sendParent } from "xstate";
import { LayoutContext, LayoutPlan } from "./layoutContext";
import { LayoutSchema, State } from "./layoutStates";
import { LayoutEvents } from "./layoutEvents";
import {
  Actions,
  layoutMachineKey,
  machineOptions,
} from "./layoutMachineOptions";

export type LayoutMachineType = Interpreter<
  LayoutContext,
  LayoutSchema,
  LayoutEvents
>;

export const createLayoutMachine = (layoutPlan: LayoutPlan) => {
  return Machine<LayoutContext, LayoutSchema, LayoutEvents>(
    {
      key: layoutMachineKey,
      initial: State.READY,
      context: {
        layoutPlan,
        selected: null,
      },
      states: {
        [State.READY]: {
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
              target: `${State.READY}.${State.SOURCE_SELECTED}`,
              actions: Actions.ASSIGN_SELECTED,
            },

            SET_ALL_DESTINATIONS: {
              actions: Actions.ASSIGN_DESTINATION_ACTIONS,
            },

            REQUEST_LAYOUT_PLAN: {
              actions: [
                sendParent((ctx) => ({
                  type: "UPDATE_LAYOUT_PLAN",
                  layoutPlan: ctx.layoutPlan,
                })),
              ],
            },
          },
        },
      },
    },
    machineOptions
  );
};
