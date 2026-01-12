import { Address } from '../../../types/stan';
import { LayoutPlan, Source } from './layoutContext';

type SelectSourceEvent = {
  type: 'SELECT_SOURCE';
  source: Source;
};
export function selectSource(source: Source): SelectSourceEvent {
  return {
    type: 'SELECT_SOURCE',
    source
  };
}

export type SetAllDestinationsEvent = {
  type: 'SET_ALL_DESTINATIONS';
  source: Source;
};

export function setAllDestinations(source: Source): SetAllDestinationsEvent {
  return {
    type: 'SET_ALL_DESTINATIONS',
    source
  };
}

export type SelectDestinationEvent = {
  type: 'SELECT_DESTINATION';
  address: Address;
};

export function selectDestination(address: Address): SelectDestinationEvent {
  return {
    type: 'SELECT_DESTINATION',
    address
  };
}

export type RemoveSourceFromSlotDestEvent = {
  type: 'REMOVE_SOURCE_FROM_SLOT_DEST';
  address: Address;
};

export type SendLayoutToParent = {
  type: 'SEND_LAYOUT_TO_PARENT';
  output: LayoutPlan;
};

export function removeSourceFromSlotDest(address: Address): RemoveSourceFromSlotDestEvent {
  return {
    type: 'REMOVE_SOURCE_FROM_SLOT_DEST',
    address
  };
}

export type RequestLayoutPlanEvent = {
  type: 'REQUEST_LAYOUT_PLAN';
};

type CancelEvent = { type: 'CANCEL' };
export function cancel(): CancelEvent {
  return { type: 'CANCEL' };
}

type DoneEvent = { type: 'DONE' };
export function done(): DoneEvent {
  return { type: 'DONE' };
}

type AddSectionGroupEvent = {
  type: 'ADD_SECTION_GROUP';
  sectionId: string;
};

type RemoveSectionGroupEvent = {
  type: 'REMOVE_SECTION_GROUP';
  sectionId: number;
};

type AssignSelectedSlots = {
  type: 'ASSIGN_SELECTED_SLOTS';
  selectedSlots: Set<Address>;
};

type ResetErrorMessageEvent = { type: 'RESET_ERROR_MESSAGE' };

export type LayoutEvents =
  | SelectSourceEvent
  | SelectDestinationEvent
  | SetAllDestinationsEvent
  | RequestLayoutPlanEvent
  | CancelEvent
  | DoneEvent
  | RemoveSourceFromSlotDestEvent
  | SendLayoutToParent
  | AddSectionGroupEvent
  | AssignSelectedSlots
  | RemoveSectionGroupEvent
  | ResetErrorMessageEvent;
