import { MachineOptions } from "xstate";
import { LayoutContext } from "./layoutContext";
import { LayoutEvents } from "./layoutEvents";
import { assign } from "@xstate/immer";
import { isEqual } from "lodash";
import { labwareAddresses } from "../../helpers/labwareHelper";

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
      ctx.layoutPlan.plannedActions.delete(e.labwareAddress.address);
    }),

    [Actions.ASSIGN_DESTINATION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION" || !ctx.selected) {
        return;
      }

      const newPlanRequestAction = {
        address: e.labwareAddress.address,
        ...ctx.selected,
      };

      if (
        isEqual(
          ctx.layoutPlan.plannedActions.get(e.labwareAddress.address),
          newPlanRequestAction
        )
      ) {
        ctx.layoutPlan.plannedActions.delete(e.labwareAddress.address);
      } else {
        ctx.layoutPlan.plannedActions.set(
          e.labwareAddress.address,
          newPlanRequestAction
        );
      }
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign((ctx, e) => {
      if (e.type !== "SELECT_DESTINATION") {
        return;
      }

      ctx.layoutPlan.plannedActions.delete(e.labwareAddress.address);
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign((ctx, e) => {
      if (e.type !== "SET_ALL_DESTINATIONS") {
        return;
      }

      labwareAddresses(ctx.layoutPlan.destinationLabware).forEach(
        (labwareAddress) => {
          ctx.layoutPlan.plannedActions.set(labwareAddress.address, {
            address: labwareAddress.address,
            sampleId: e.action.sampleId,
            source: e.action.source,
          });
        }
      );
    }),
  },
};
