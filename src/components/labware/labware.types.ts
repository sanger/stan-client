import { Maybe, SlotFieldsFragment } from "../../types/sdk";

export type SelectionMode = "single" | "multi";
export type Selectable = "none" | "any" | "non_empty" | "empty";

export interface LabwareMachineContext {
  slots: Array<SlotFieldsFragment>;
  selectedAddresses: Set<string>;
  lastSelectedAddress: Maybe<string>;
  selectionMode: SelectionMode;
  selectable: Selectable;
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

type SelectSlotEvent = { type: "SELECT_SLOT"; address: string };
type CtrlSelectSlotEvent = { type: "CTRL_SELECT_SLOT"; address: string };
type SelectToSlotEvent = { type: "SELECT_TO_SLOT"; address: string };

export type ChangeSelectionModeEvent = {
  type: "CHANGE_SELECTION_MODE";
  selectionMode: SelectionMode;
  selectable: Selectable;
};

export type UpdateSlotsEvent = {
  type: "UPDATE_SLOTS";
  slots: Array<SlotFieldsFragment>;
};

type ResetSelected = { type: "RESET_SELECTED" };

export type LabwareMachineEvent =
  | SelectSlotEvent
  | CtrlSelectSlotEvent
  | SelectToSlotEvent
  | ChangeSelectionModeEvent
  | UpdateSlotsEvent
  | ResetSelected;
