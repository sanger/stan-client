// This is a duplication of the original labware.types component with
// modifications to support per-section labware operations.
// When a slot belonging to a section is clicked, the entire section is highlighted,
// and all operations are performed at the section level.
// Once the per-section labware feature is verified, stable, and integrated
// into the other operations, this component will replace the original labware.types.

import { Maybe, SlotFieldsFragment } from '../../types/sdk';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';

export type SelectionMode = 'single' | 'multi';
export type Selectable = 'none' | 'any' | 'non_empty' | 'empty';

export interface LabwareMachineContext {
  slots: Array<SlotFieldsFragment>;
  selectedAddresses: Set<string>;
  lastSelectedAddress: Maybe<string>;
  selectionMode: SelectionMode;
  selectable: Selectable;
  sectionGroups: Record<string, PlannedSectionDetails>;
}

export interface LabwareMachineSchema {
  states: {
    unknown: {};
    non_selectable: {};
    selectable: {
      states: {
        any: {
          states: {
            single: {};
            multi: {};
          };
        };
        non_empty: {
          states: {
            single: {};
            multi: {};
          };
        };
        empty: {
          states: {
            single: {};
            multi: {};
          };
        };
      };
    };
    locked: {};
  };
}

type SelectSlotEvent = { type: 'SELECT_SLOT'; address: string };
type CtrlSelectSlotEvent = { type: 'CTRL_SELECT_SLOT'; address: string };
type SelectToSlotEvent = { type: 'SELECT_TO_SLOT'; address: string };

export type ChangeSelectionModeEvent = {
  type: 'CHANGE_SELECTION_MODE';
  selectionMode: SelectionMode;
  selectable: Selectable;
};

export type UpdateSlotsEvent = {
  type: 'UPDATE_SLOTS';
  slots: Array<SlotFieldsFragment>;
};

type ResetSelected = { type: 'RESET_SELECTED' };

export type LabwareMachineEvent =
  | SelectSlotEvent
  | CtrlSelectSlotEvent
  | SelectToSlotEvent
  | ChangeSelectionModeEvent
  | UpdateSlotsEvent
  | ResetSelected;
