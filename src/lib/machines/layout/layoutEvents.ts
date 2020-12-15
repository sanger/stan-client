import { Address, SourcePlanRequestAction } from "../../../types/stan";
import { Source } from "./layoutContext";

type SelectSourceEvent = {
  type: "SELECT_SOURCE";
  source: Source;
};
export function selectSource(source: Source): SelectSourceEvent {
  return {
    type: "SELECT_SOURCE",
    source,
  };
}

export type SetAllDestinationsEvent = {
  type: "SET_ALL_DESTINATIONS";
  source: Source;
};

export function setAllDestinations(source: Source): SetAllDestinationsEvent {
  return {
    type: "SET_ALL_DESTINATIONS",
    source,
  };
}

export type SelectDestinationEvent = {
  type: "SELECT_DESTINATION";
  address: Address;
};

export function selectDestination(address: Address): SelectDestinationEvent {
  return {
    type: "SELECT_DESTINATION",
    address,
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
