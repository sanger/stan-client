import { MachineOptions } from "xstate";
import { Action, LayoutContext } from "./layoutContext";
import { LayoutEvents } from "./layoutEvents";
import { assign } from "@xstate/immer";
import { isEqual } from "lodash";

export const layoutMachineKey = "layoutMachine";

export enum Actions {
  ASSIGN_SELECTED = "layoutMachine.assignSelected",
  DELETE_DESTINATION_ACTION = "layoutMachine.deleteDestinationAction",
  ASSIGN_DESTINATION = "layoutMachine.assignDestination",
  REMOVE_PLANNED_ACTION = "layoutMachine.removePlannedAction",
  ASSIGN_DESTINATION_ACTIONS = "layoutMachine.assignDestinationActions",
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
      ctx.selected = e.action;
    }),

    [Actions.DELETE_DESTINATION_ACTION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }
      ctx.layoutPlan.plannedActions.delete(e.address);
    }),

    [Actions.ASSIGN_DESTINATION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION" || !ctx.selected) {
        return;
      }

      const action: Action = {
        sampleId: ctx.selected.sampleId,
        sourceAddress: ctx.selected.source.address,
        sourceBarcode: ctx.selected.source.barcode,
      };

      if (isEqual(ctx.layoutPlan.plannedActions.get(e.address), action)) {
        ctx.layoutPlan.plannedActions.delete(e.address);
      } else {
        ctx.layoutPlan.plannedActions.set(e.address, action);
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
        ctx.layoutPlan.plannedActions.set(slot.address, {
          sampleId: e.action.sampleId,
          sourceAddress: e.action.source.address,
          sourceBarcode: e.action.source.barcode,
        });
      });
    }),
  },
};
