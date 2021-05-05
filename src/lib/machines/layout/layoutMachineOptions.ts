import { MachineOptions } from "xstate";
import { Source, LayoutContext } from "./layoutContext";
import { LayoutEvents } from "./layoutEvents";
import { assign } from "@xstate/immer";
import { find, isEqual, sortBy } from "lodash";

export const layoutMachineKey = "layoutMachine";

export enum Actions {
  ASSIGN_SELECTED = "layoutMachine.assignSelected",
  DELETE_DESTINATION_ACTION = "layoutMachine.deleteDestinationAction",
  ASSIGN_DESTINATION = "layoutMachine.assignDestination",
  REMOVE_PLANNED_ACTION = "layoutMachine.removePlannedAction",
  ASSIGN_DESTINATION_ACTIONS = "layoutMachine.assignDestinationActions",
  TOGGLE_DESTINATION = "layoutMachine.toggleDestination",
}

export const machineOptions: Partial<MachineOptions<
  LayoutContext,
  LayoutEvents
>> = {
  actions: {
    [Actions.ASSIGN_SELECTED]: assign((ctx, e) => {
      if (e.type !== "SELECT_SOURCE") {
        return;
      }

      ctx.selected = isEqual(ctx.selected, e.source) ? null : e.source;
    }),

    [Actions.DELETE_DESTINATION_ACTION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }
      ctx.layoutPlan.plannedActions.delete(e.address);
    }),

    [Actions.ASSIGN_DESTINATION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }

      if (!ctx.selected) {
        ctx.layoutPlan.plannedActions.delete(e.address);
        return;
      }

      const action: Source = {
        sampleId: ctx.selected.sampleId,
        address: ctx.selected.address,
        labware: ctx.selected.labware,
      };

      const plannedAddressActions = ctx.layoutPlan.plannedActions.get(
        e.address
      );

      // There's no limit to how many sections can be put in a slot right now.
      // If there needs to be in the future, this is the place to do that.
      if (plannedAddressActions && find(plannedAddressActions, action)) {
        ctx.layoutPlan.plannedActions.set(e.address, [
          ...plannedAddressActions,
          action,
        ]);
      } else {
        ctx.layoutPlan.plannedActions.set(e.address, [action]);
      }
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }

      ctx.layoutPlan.plannedActions.delete(e.address);
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign((ctx, e) => {
      if (e.type !== "SET_ALL_DESTINATIONS") {
        return;
      }

      ctx.layoutPlan.destinationLabware.slots.forEach((slot) => {
        ctx.layoutPlan.plannedActions.set(slot.address, [e.source]);
      });
    }),

    [Actions.TOGGLE_DESTINATION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }

      // If there was never anything in this slot, do nothing
      if (ctx.possibleActions && !ctx.possibleActions.has(e.address)) {
        return;
      }

      const slotActions = ctx.layoutPlan.plannedActions.get(e.address) ?? [];

      if (slotActions.length > 1) {
        const newSlotActions = sortBy(slotActions, ["newSection"]);
        ctx.layoutPlan.plannedActions.set(
          e.address,
          newSlotActions.slice(0, -1)
        );
      } else if (slotActions.length === 1) {
        ctx.layoutPlan.plannedActions.delete(e.address);
      } else {
        const source = ctx.possibleActions?.get(e.address);
        if (source) {
          ctx.layoutPlan.plannedActions.set(e.address, source);
        }
      }
    }),
  },
};
