import { LabwareAddress, SourcePlanRequestAction } from "../../../types/stan";

type SelectSourceEvent = {
  type: "SELECT_SOURCE";
  action: SourcePlanRequestAction;
};
export function selectSource(
  action: SourcePlanRequestAction
): SelectSourceEvent {
  return {
    type: "SELECT_SOURCE",
    action,
  };
}

export type SetAllDestinationsEvent = {
  type: "SET_ALL_DESTINATIONS";
  action: SourcePlanRequestAction;
};

export function setAllDestinations(
  action: SourcePlanRequestAction
): SetAllDestinationsEvent {
  return {
    type: "SET_ALL_DESTINATIONS",
    action,
  };
}

export type SelectDestinationEvent = {
  type: "SELECT_DESTINATION";
  labwareAddress: LabwareAddress;
};

export function selectDestination(
  labwareAddress: LabwareAddress
): SelectDestinationEvent {
  return {
    type: "SELECT_DESTINATION",
    labwareAddress,
  };
}

export type RequestLayoutPlanEvent = {
  type: "REQUEST_LAYOUT_PLAN";
};

export type LayoutEvents =
  | SelectSourceEvent
  | SelectDestinationEvent
  | SetAllDestinationsEvent
  | RequestLayoutPlanEvent;
