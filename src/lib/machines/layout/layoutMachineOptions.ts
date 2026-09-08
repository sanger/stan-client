import { LayoutContext, PlannedSectionDetails, Source } from './layoutContext';
import { isEqual } from 'lodash';
import { compareAddresses, firstAddress } from '../../helpers/labwareHelper';
import { assign, InternalMachineImplementations, sendParent } from 'xstate';
import { LayoutEvents } from './layoutEvents';
import { produce } from 'immer';
import { LayoutSchema } from './layoutStates';
import { convertLabwareTypeToSourceType, isPlanningByLabware } from '../../../components/planning/LabwarePlan';
import { LabwareFlaggedFieldsFragment } from '../../../types/sdk';

export const layoutMachineKey = 'layoutMachine';

export enum Actions {
  ASSIGN_SELECTED = 'layoutMachine.assignSelected',
  ASSIGN_DESTINATION = 'layoutMachine.assignDestination',
  REMOVE_PLANNED_ACTION = 'layoutMachine.removePlannedAction',
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

const sectionGroupForDestinationAddress = (plannedActions: Array<PlannedSectionDetails>, address: string) => {
  return plannedActions.find((plan) => plan.addresses.has(address));
};

export const machineOptions: InternalMachineImplementations<LayoutMachineImplementation> = {
  actions: {
    [Actions.ASSIGN_SELECTED]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_SOURCE') {
        return context;
      }
      return { ...context, selected: isEqual(context.selected, event.source) ? null : event.source };
    }),

    [Actions.ASSIGN_DESTINATION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }
      return produce(context, (draft) => {
        // In a sectioning plan for tubes, the user assigns a labware to a slot, unlike other labware types,
        // where the user assigns a sample to a slot. Therefore, we need to explicitly add all samples
        // within the selected labware to the plan.
        const slotPreviousSampleIds: Array<number> = [];
        draft.layoutPlan.plannedActions.forEach((pa) => {
          if (pa.addresses.has(event.address)) {
            pa.addresses.delete(event.address);
            slotPreviousSampleIds.push(pa.source.sampleId);
          }
        });
        // From the UI, the user can only assign one source to a slot.
        // Therefore, if the user assigns a new source to a slot that already has a source assigned,
        // we remove the previous source from that slot.

        draft.layoutPlan.plannedActions = draft.layoutPlan.plannedActions.filter((pa) => pa.addresses.size > 0);

        if (!context.selected || slotPreviousSampleIds.includes(context.selected.sampleId)) {
          return;
        }
        // In a sectioning plan for tubes, the user assigns a labware to a slot, unlike other labware types,
        // where the user assigns a sample to a slot. Therefore, we need to explicitly add all samples
        // within the selected labware to the plan.
        const selectedSource: Source = Object.assign({}, draft.selected);
        const selectedDestinationLabware = draft.layoutPlan.destinationLabware;
        if (isPlanningByLabware(selectedDestinationLabware.labwareType, draft.layoutPlan.operationType)) {
          const sources = convertLabwareTypeToSourceType(
            [selectedSource.labware as LabwareFlaggedFieldsFragment],
            selectedSource.sampleThickness
          );
          sources.forEach((source) => {
            draft.layoutPlan.plannedActions.push({
              addresses: new Set([event.address]),
              source
            });
          });
        } else {
          draft.layoutPlan.plannedActions.push({
            addresses: new Set([event.address]),
            source: selectedSource
          });
        }
        draft.layoutPlan.plannedActions.sort((a, b) =>
          compareAddresses(firstAddress(a.addresses), firstAddress(b.addresses))
        );
      });
    }),

    [Actions.REMOVE_PLANNED_ACTION]: assign(({ context, event }) => {
      if (event.type !== 'SELECT_DESTINATION') {
        return context;
      }

      return produce(context, (draft) => {
        const plannedSection = sectionGroupForDestinationAddress(draft.layoutPlan.plannedActions, event.address);
        if (plannedSection) {
          const addresses = plannedSection.addresses;
          // If removing the address leaves the group empty → delete the whole sectionGroup
          addresses.delete(event.address);
          if (addresses.size === 0) {
            draft.layoutPlan.plannedActions = draft.layoutPlan.plannedActions.filter((plan) => plan.addresses.size > 0);
          }
        }
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

        if (selected && selected.size > 0) {
          let referenceSource: Source | undefined;

          for (const address of selected) {
            const planned = sectionGroupForDestinationAddress(draft.layoutPlan.plannedActions, address);
            if (!planned) {
              draft.errorMessage = `Cannot assign an empty slot to a section. Please assign a source to slot ${address} first.`;
              return;
            }
            const source = planned.source; // compare against the first item

            if (!referenceSource) {
              referenceSource = source;
            } else if (
              source.sampleId !== referenceSource.sampleId ||
              source.labware.id !== referenceSource.labware.id
            ) {
              draft.errorMessage = `Cannot group slots from different sources: slot ${address} has a different source than others.`;
              return;
            }
          }

          for (const plannedAction of draft.layoutPlan.plannedActions) {
            // --- Remove address that used to be assigned to a different plan so to assign to a new plan ----------------------------------
            for (const slotAddress of selected) {
              plannedAction.addresses.delete(slotAddress);
            }
            // unassign the section group if it was previously assigned to this section group
            plannedAction.sectionGroupId =
              plannedAction.sectionGroupId === event.sectionId ? undefined : plannedAction.sectionGroupId;
          }
          draft.layoutPlan.plannedActions = draft.layoutPlan.plannedActions.filter(
            (planned) => planned.addresses.size > 0
          );

          // --- Apply the new section group ----------------------------------------
          draft.layoutPlan.plannedActions.push({
            addresses: new Set(selected),
            sectionGroupId: event.sectionId,
            source: { ...referenceSource! }
          });
          draft.selectedSlots = undefined;
        }
        draft.layoutPlan.plannedActions.sort((a, b) =>
          compareAddresses(firstAddress(a.addresses), firstAddress(b.addresses))
        );
      });
    }),
    [Actions.REMOVE_SECTION_GROUP]: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_SECTION_GROUP') {
        return context;
      }
      return produce(context, (draft) => {
        if (event.sectionId === undefined) {
          draft.errorMessage = 'Select a section color before removing a section.';
          return;
        }
        const sectionToRemove = draft.layoutPlan.plannedActions.find((plan) => plan.sectionGroupId === event.sectionId);
        if (!sectionToRemove) {
          draft.errorMessage = 'No section is assigned to the selected color.';
          return;
        }

        const remaining = draft.layoutPlan.plannedActions.filter((plan) => plan.sectionGroupId !== event.sectionId);
        const { addresses, ...sectionDetails } = sectionToRemove;
        for (const address of addresses) {
          remaining.push({ addresses: new Set([address]), ...sectionDetails });
        }

        draft.layoutPlan.plannedActions = remaining;
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
