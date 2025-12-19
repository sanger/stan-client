import { LayoutContext, PlannedSectionDetails, Source } from './layoutContext';
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
  ADD_SOURCE_TO_SLOT_DEST = 'layoutMachine.addSourceToSlotDest',
  REMOVE_SOURCE_FROM_SLOT_DEST = 'layoutMachine.removeSourceFromSlotDest',
  SEND_LAYOUT_TO_PARENT = 'layoutMachine.sendLayoutToParent',
  CANCEL_EDIT_LAYOUT = 'layoutMachine.cancelEditLayout',
  ASSIGN_SELECTED_SLOTS = 'layoutMachine.assignSelectedSlots',
  ADD_SECTION_GROUP = 'layoutMachine.addSectionGroup',
  REMOVE_SECTION_GROUP = 'layoutMachine.removeSectionGroup',
  RESET_ERROR_MESSAGE = 'layoutMachine.resetErrorMessage'
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

const sectionGroupIdForDestinationAddress = (
  plannedActions: Record<string, PlannedSectionDetails>,
  address: string
) => {
  // CASE 1 — The "address" is actually the key of a sectionGroup
  if (plannedActions[address]) {
    return address;
  }

  // CASE 2 — Look inside each sectionGroup to find the address in .addresses
  for (const sectionGroupId of Object.keys(plannedActions)) {
    const addresses = plannedActions[sectionGroupId].addresses;

    if (addresses.has(address)) {
      return sectionGroupId;
    }
  }

  return null;
};

const deleteDestinationAddressFromGroup = (
  plannedActions: Record<string, PlannedSectionDetails>,
  address: string
): Record<string, PlannedSectionDetails> => {
  const sectionGroupId = sectionGroupIdForDestinationAddress(plannedActions, address);

  if (sectionGroupId) {
    // CASE 1 — The "address" is actually the key of a sectionGroup
    if (sectionGroupId === address) {
      delete plannedActions[sectionGroupId];
      return plannedActions;
    }
    // CASE 2 — The "address" is inside a sectionGroup
    const addresses = plannedActions[sectionGroupId].addresses;
    // If removing the address leaves the group empty → delete the whole sectionGroup
    addresses.delete(address);
    if (addresses.size === 0) {
      delete plannedActions[sectionGroupId];
    }
  }
  return plannedActions;
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
        draft.layoutPlan.plannedActions = deleteDestinationAddressFromGroup(
          draft.layoutPlan.plannedActions,
          event.address
        );
      });
    }),

    [Actions.ASSIGN_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }

      return produce(context, (draft) => {
        const plannedActions = draft.layoutPlan.plannedActions;

        if (
          !context.selected ||
          (plannedActions[event.address] && context.selected.sampleId === plannedActions[event.address].source.sampleId)
        ) {
          draft.layoutPlan.plannedActions = deleteDestinationAddressFromGroup(
            draft.layoutPlan.plannedActions,
            event.address
          );
        } else {
          const action: Source = Object.assign({}, draft.selected);
          action.replicateNumber = tissue(Object.assign({}, action.labware as LabwareFieldsFragment))?.replicate ?? '';
          draft.layoutPlan.plannedActions[event.address] = {
            addresses: new Set([event.address]),
            source: action
          };
        }
      });
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      return produce(context, (draft) => {
        draft.layoutPlan.plannedActions = deleteDestinationAddressFromGroup(
          draft.layoutPlan.plannedActions,
          event.address
        );
      });
    }),

    [Actions.ASSIGN_DESTINATION_ACTIONS]: assign(({ context, event }) => {
      if (event.type !== 'SET_ALL_DESTINATIONS') {
        return context;
      }
      return produce(context, (draft) => {
        draft.layoutPlan.destinationLabware.slots.forEach((slot) => {
          draft.layoutPlan.plannedActions[slot.address] = {
            addresses: new Set([slot.address]),
            source: event.source
          };
        });
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
    }),
    [Actions.ADD_SECTION_GROUP]: assign(({ context, event }) => {
      if (event.type !== 'ADD_SECTION_GROUP') {
        return context;
      }
      return produce(context, (draft) => {
        const selected = draft.selectedSlots;
        // User has selected slots --------------------------------------
        if (selected && selected.size > 0) {
          let referenceSource: Source | undefined;

          for (const address of selected) {
            const addressSectionGroupId = sectionGroupIdForDestinationAddress(draft.layoutPlan.plannedActions, address);
            const planned = addressSectionGroupId && draft.layoutPlan.plannedActions[addressSectionGroupId];

            if (!planned) {
              draft.errorMessage = `Cannot assign an empty slot to a section. Please assign a source to slot ${address} first.`;
              return;
            }

            const source = planned.source; // compare first item only

            if (!referenceSource) {
              referenceSource = source;
            } else if (
              source.sampleId !== referenceSource.sampleId ||
              source.labware.id !== referenceSource.labware.id
            ) {
              draft.errorMessage = `Cannot group slots from different sources: slot ${address} has a different source than others.`;
              return;
            }
            if (draft.errorMessage?.length === 0) delete draft.layoutPlan.plannedActions[address];
          }

          if (draft.errorMessage) return;
          for (const sectionGroupId of Object.keys(draft.layoutPlan.plannedActions)) {
            const group = draft.layoutPlan.plannedActions[sectionGroupId];

            for (const slotAddress of selected) {
              group.addresses.delete(slotAddress);
            }
            if (group.addresses.size === 0) {
              delete draft.layoutPlan.plannedActions[sectionGroupId];
            }
          }
          // --- Remove address that used to be assigned to the same section group --------------------------------------
          const previousSection = draft.layoutPlan.plannedActions[event.sectionId];
          if (previousSection) {
            previousSection.addresses.forEach((address) => {
              draft.layoutPlan.plannedActions[address] = {
                addresses: new Set([address]),
                source: { ...previousSection.source }
              };
            });
          }
          // --- Apply the new section group ----------------------------------------
          draft.layoutPlan.plannedActions[event.sectionId] = {
            addresses: new Set(selected),
            source: { ...referenceSource! }
          };
          draft.selectedSlots = undefined;
        }
      });
    }),
    [Actions.REMOVE_SECTION_GROUP]: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_SECTION_GROUP') {
        return context;
      }
      return produce(context, (draft) => {
        if (draft.layoutPlan.plannedActions[event.sectionId]) {
          const { addresses, source } = draft.layoutPlan.plannedActions[event.sectionId];
          delete draft.layoutPlan.plannedActions[event.sectionId];
          for (const address of addresses) {
            draft.layoutPlan.plannedActions[address] = {
              addresses: new Set([address]),
              source: source
            };
          }
        }
      });
    }),
    [Actions.ASSIGN_SELECTED_SLOTS]: assign(({ context, event }) => {
      if (event.type !== 'ASSIGN_SELECTED_SLOTS') {
        return context;
      }
      return produce(context, (draft) => {
        draft.selectedSlots = event.selectedSlots;
      });
    }),
    [Actions.RESET_ERROR_MESSAGE]: assign(({ context, event }) => {
      if (event.type !== 'RESET_ERROR_MESSAGE') {
        return context;
      }
      return produce(context, (draft) => {
        draft.errorMessage = undefined;
      });
    })
  }
};
