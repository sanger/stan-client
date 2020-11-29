import { GetSectioningInfoQuery } from "../../../types/graphql";
import { UpdateLabwaresEvent } from "../labwareMachine";

export type SelectLabwareTypeEvent = {
  type: "SELECT_LABWARE_TYPE";
  labwareType: GetSectioningInfoQuery["labwareTypes"][number];
};
export function selectLabwareType(
  labwareType: GetSectioningInfoQuery["labwareTypes"][number]
): SelectLabwareTypeEvent {
  return {
    type: "SELECT_LABWARE_TYPE",
    labwareType,
  };
}

export type AddLabwareLayoutEvent = {
  type: "ADD_LABWARE_LAYOUT";
};
export function addLabwareLayout(): AddLabwareLayoutEvent {
  return { type: "ADD_LABWARE_LAYOUT" };
}

type GetSectioningInfoResolveEvent = {
  type: "done.invoke.getSectioningInfo";
  data: GetSectioningInfoQuery;
};

type DeleteLabwareLayoutEvent = {
  type: "DELETE_LABWARE_LAYOUT";
  index: number;
};
export function deleteLabwareLayout(index: number): DeleteLabwareLayoutEvent {
  return {
    type: "DELETE_LABWARE_LAYOUT",
    index,
  };
}

export type SectioningEvents =
  | SelectLabwareTypeEvent
  | AddLabwareLayoutEvent
  | DeleteLabwareLayoutEvent
  | GetSectioningInfoResolveEvent
  | UpdateLabwaresEvent;
