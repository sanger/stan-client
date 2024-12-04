import { LayoutContext, Source } from './layoutContext';
import { isEqual } from 'lodash';
import { tissue } from '../../helpers/labwareHelper';
import { LabwareFieldsFragment } from '../../../types/sdk';
import { assign, InternalMachineImplementations, sendParent } from 'xstate';
import { LayoutEvents } from './layoutEvents';
import { produce } from 'immer';
import { LayoutSchema } from './layoutStates';

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

type LayoutMachineImplementation = {
  context: LayoutContext;
  events: LayoutEvents;
  schema: LayoutSchema;
  actors: any;
  actions: any;
  guards: any;
  delays: any;
  tags: any;
  emitted: any;
};

export const machineOptions: InternalMachineImplementations<LayoutMachineImplementation> = {
  actions: {
    [Actions.ASSIGN_SELECTED]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_SOURCE') {
        return context;
      }
      return { ...context, selected: isEqual(context.selected, event.source) ? null : event.source };
    }),

    [Actions.DELETE_DESTINATION_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      return produce(context, (draft) => {
        draft.layoutPlan.plannedActions.delete(event.address);
      });
    }),

    [Actions.ASSIGN_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }

      return produce(context, (draft) => {
        const plannedActions = draft.layoutPlan.plannedActions;

        if (!context.selected || context.selected.sampleId === plannedActions.get(event.address)?.[0].sampleId) {
          plannedActions.delete(event.address);
        } else {
          const action: Source = Object.assign({}, draft.selected);
          action.replicateNumber = tissue(Object.assign({}, action.labware as LabwareFieldsFragment))?.replicate ?? '';
          plannedActions.set(event.address, [action]);
        }
        draft.layoutPlan.plannedActions = plannedActions;
      });
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      return produce(context, (draft) => {
        draft.layoutPlan.plannedActions.delete(event.address);
      });
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign(({ context, event }) => {
      if (event.type !== 'SET_ALL_DESTINATIONS') {
        return context;
      }
      return produce(context, (draft) => {
        draft.layoutPlan.destinationLabware.slots.forEach((slot) => {
          draft.layoutPlan.plannedActions.set(slot.address, [event.source]);
        });
      });
    }),

    [Actions.ADD_SECTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      return produce(context, (draft) => {
        if (!draft.possibleActions) {
          draft.possibleActions = new Map();
        }
        if (!context.possibleActions?.has(event.address)) {
          return context;
        }
        const slotActions = draft.possibleActions?.get(event.address)!;
        //Initialise section numbers to 0 for new additions
        Array.from(slotActions.values()).forEach((val: Source) => (val.newSection = 0));
        const plannedActionsForSlot = draft.layoutPlan.plannedActions.get(event.address);
        if (!plannedActionsForSlot) {
          draft.layoutPlan.plannedActions.set(event.address, slotActions);
        } else {
          draft.layoutPlan.plannedActions.set(event.address, [...plannedActionsForSlot, ...slotActions]);
        }
      });
    }),

    [Actions.REMOVE_SECTION]: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_SECTION') {
        return context;
      }
      if (!context.possibleActions?.has(event.address)) {
        return context;
      }
      return produce(context, (draft) => {
        const slotActions = draft.layoutPlan.plannedActions.get(event.address) ?? [];

        if (slotActions.length > 1) {
          slotActions.pop();
        } else if (slotActions.length === 1) {
          draft.layoutPlan.plannedActions.delete(event.address);
        }
      });
    }),

    [Actions.TOGGLE_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      // If there was never anything in this slot, do nothing
      if (context.possibleActions && !context.possibleActions.has(event.address)) {
        return context;
      }
      return produce(context, (draft) => {
        const slotActions = draft.layoutPlan.plannedActions.get(event.address) ?? [];

        if (slotActions.length > 1) {
          slotActions.pop();
        } else if (slotActions.length === 1) {
          draft.layoutPlan.plannedActions.delete(event.address);
        } else {
          const source = draft.possibleActions?.get(event.address);
          if (source) {
            draft.layoutPlan.plannedActions.set(event.address, source);
          }
        }
        return context;
      });
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
