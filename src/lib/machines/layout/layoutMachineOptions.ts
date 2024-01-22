import { LayoutContext, Source } from './layoutContext';
import { isEqual } from 'lodash';
import { tissue } from '../../helpers/labwareHelper';
import { LabwareFieldsFragment } from '../../../types/sdk';
import { assign, MachineImplementations, sendParent } from 'xstate';
import { LayoutEvents } from './layoutEvents';

export const layoutMachineKey = 'layoutMachine';

export enum Actions {
  ASSIGN_SELECTED = 'layoutMachine.assignSelected',
  DELETE_DESTINATION_ACTION = 'layoutMachine.deleteDestinationAction',
  ASSIGN_DESTINATION = 'layoutMachine.assignDestination',
  REMOVE_PLANNED_ACTION = 'layoutMachine.removePlannedAction',
  ASSIGN_DESTINATION_ACTIONS = 'layoutMachine.assignDestinationActions',
  TOGGLE_DESTINATION = 'layoutMachine.toggleDestination',
  ADD_SECTION = 'layoutMachine.addSection',
  REMOVE_SECTION = 'layoutMachine.removeSection',
  SEND_LAYOUT_TO_PARENT = 'layoutMachine.sendLayoutToParent',
  CANCEL_EDIT_LAYOUT = 'layoutMachine.cancelEditLayout'
}

export const machineOptions: MachineImplementations<LayoutContext, LayoutEvents> = {
  actions: {
    [Actions.ASSIGN_SELECTED]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_SOURCE') {
        return context;
      }
      context.selected = isEqual(context.selected, event.source) ? null : event.source;
      return context;
    }),

    [Actions.DELETE_DESTINATION_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      context.layoutPlan.plannedActions.delete(event.address);
      return context;
    }),

    [Actions.ASSIGN_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      const plannedActions = context.layoutPlan.plannedActions;

      if (!context.selected || context.selected.sampleId === plannedActions.get(event.address)?.[0].sampleId) {
        plannedActions.delete(event.address);
      } else {
        const action: Source = Object.assign({}, context.selected);
        action.replicateNumber = tissue(Object.assign({}, action.labware as LabwareFieldsFragment))?.replicate ?? '';
        plannedActions.set(event.address, [action]);
      }
      context.layoutPlan.plannedActions = plannedActions;

      return context;
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      context.layoutPlan.plannedActions.delete(event.address);
      return context;
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign(({ context, event }) => {
      if (event.type !== 'SET_ALL_DESTINATIONS') {
        return context;
      }

      context.layoutPlan.destinationLabware.slots.forEach((slot) => {
        context.layoutPlan.plannedActions.set(slot.address, [event.source]);
      });
      return context;
    }),

    [Actions.ADD_SECTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      if (!context.possibleActions?.has(event.address)) {
        return context;
      }
      const slotActions = context.possibleActions?.get(event.address)!;
      //Initialise section numbers to 0 for new additions
      Array.from(slotActions.values()).forEach((val: Source) => (val.newSection = 0));
      const plannedActionsForSlot = context.layoutPlan.plannedActions.get(event.address);
      if (!plannedActionsForSlot) {
        context.layoutPlan.plannedActions.set(event.address, slotActions);
      } else {
        context.layoutPlan.plannedActions.set(event.address, [...plannedActionsForSlot, ...slotActions]);
      }
      return context;
    }),

    [Actions.REMOVE_SECTION]: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_SECTION') {
        return context;
      }
      if (!context.possibleActions?.has(event.address)) {
        return context;
      }

      const slotActions = context.layoutPlan.plannedActions.get(event.address) ?? [];

      if (slotActions.length > 1) {
        slotActions.pop();
      } else if (slotActions.length === 1) {
        context.layoutPlan.plannedActions.delete(event.address);
      }
      return context;
    }),

    [Actions.TOGGLE_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      // If there was never anything in this slot, do nothing
      if (context.possibleActions && !context.possibleActions.has(event.address)) {
        return context;
      }

      const slotActions = context.layoutPlan.plannedActions.get(event.address) ?? [];

      if (slotActions.length > 1) {
        slotActions.pop();
      } else if (slotActions.length === 1) {
        context.layoutPlan.plannedActions.delete(event.address);
      } else {
        const source = context.possibleActions?.get(event.address);
        if (source) {
          context.layoutPlan.plannedActions.set(event.address, source);
        }
      }
      return context;
    }),
    [Actions.SEND_LAYOUT_TO_PARENT]: sendParent(({ context }) => {
      return {
        type: 'ASSIGN_LAYOUT_PLAN',
        layoutPlan: { ...context.layoutPlan }
      };
    }),
    [Actions.CANCEL_EDIT_LAYOUT]: sendParent(() => {
      return {
        type: 'CANCEL_EDIT_LAYOUT'
      };
    })
  }
};
