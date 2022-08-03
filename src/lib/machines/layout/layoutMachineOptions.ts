import { MachineOptions } from 'xstate';
import { LayoutContext, Source } from './layoutContext';
import { LayoutEvents } from './layoutEvents';
import { assign } from '@xstate/immer';
import { isEqual } from 'lodash';

export const layoutMachineKey = 'layoutMachine';

export enum Actions {
  ASSIGN_SELECTED = 'layoutMachine.assignSelected',
  DELETE_DESTINATION_ACTION = 'layoutMachine.deleteDestinationAction',
  ASSIGN_DESTINATION = 'layoutMachine.assignDestination',
  REMOVE_PLANNED_ACTION = 'layoutMachine.removePlannedAction',
  ASSIGN_DESTINATION_ACTIONS = 'layoutMachine.assignDestinationActions',
  TOGGLE_DESTINATION = 'layoutMachine.toggleDestination',
  ADD_SECTION = 'layoutMachine.addSection',
  REMOVE_SECTION = 'layoutMachine.removeSection'
}

export const machineOptions: Partial<MachineOptions<LayoutContext, LayoutEvents>> = {
  actions: {
    [Actions.ASSIGN_SELECTED]: assign((ctx, e) => {
      if (e.type !== 'SELECT_SOURCE') {
        return;
      }

      ctx.selected = isEqual(ctx.selected, e.source) ? null : e.source;
    }),

    [Actions.DELETE_DESTINATION_ACTION]: assign((ctx, e) => {
      if (e.type !== 'SELECT_DESTINATION') {
        return;
      }
      ctx.layoutPlan.plannedActions.delete(e.address);
    }),

    [Actions.ASSIGN_DESTINATION]: assign((ctx, e) => {
      if (e.type !== 'SELECT_DESTINATION') {
        return;
      }
      const plannedActions = ctx.layoutPlan.plannedActions;

      if (!ctx.selected || ctx.selected.sampleId === plannedActions.get(e.address)?.[0].sampleId) {
        plannedActions.delete(e.address);
      } else {
        const action: Source = Object.assign({}, ctx.selected);
        plannedActions.set(e.address, [action]);
      }
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign((ctx, e) => {
      if (e.type !== 'SELECT_DESTINATION') {
        return;
      }
      ctx.layoutPlan.plannedActions.delete(e.address);
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign((ctx, e) => {
      if (e.type !== 'SET_ALL_DESTINATIONS') {
        return;
      }

      ctx.layoutPlan.destinationLabware.slots.forEach((slot) => {
        ctx.layoutPlan.plannedActions.set(slot.address, [e.source]);
      });
    }),

    [Actions.ADD_SECTION]: assign((ctx, e) => {
      if (e.type !== 'SELECT_DESTINATION') {
        return;
      }
      if (!ctx.possibleActions?.has(e.address)) {
        return;
      }
      const slotActions = ctx.possibleActions?.get(e.address)!;
      //Initialise section numbers to 0 for new additions
      Array.from(slotActions.values()).forEach((val) => (val.newSection = 0));
      const plannedActionsForSlot = ctx.layoutPlan.plannedActions.get(e.address);
      if (!plannedActionsForSlot) {
        ctx.layoutPlan.plannedActions.set(e.address, slotActions);
      } else {
        ctx.layoutPlan.plannedActions.set(e.address, [...plannedActionsForSlot, ...slotActions]);
      }
    }),

    [Actions.REMOVE_SECTION]: assign((ctx, e) => {
      if (e.type !== 'REMOVE_SECTION') {
        return;
      }
      if (!ctx.possibleActions?.has(e.address)) {
        return;
      }

      const slotActions = ctx.layoutPlan.plannedActions.get(e.address) ?? [];

      if (slotActions.length > 1) {
        slotActions.pop();
      } else if (slotActions.length === 1) {
        ctx.layoutPlan.plannedActions.delete(e.address);
      }
    }),

    [Actions.TOGGLE_DESTINATION]: assign((ctx, e) => {
      if (e.type !== 'SELECT_DESTINATION') {
        return;
      }
      // If there was never anything in this slot, do nothing
      if (ctx.possibleActions && !ctx.possibleActions.has(e.address)) {
        return;
      }

      const slotActions = ctx.layoutPlan.plannedActions.get(e.address) ?? [];

      if (slotActions.length > 1) {
        slotActions.pop();
      } else if (slotActions.length === 1) {
        ctx.layoutPlan.plannedActions.delete(e.address);
      } else {
        const source = ctx.possibleActions?.get(e.address);
        if (source) {
          ctx.layoutPlan.plannedActions.set(e.address, source);
        }
      }
    })
  }
};
