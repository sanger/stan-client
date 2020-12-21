import { GetSectioningInfoQuery } from "../../../types/graphql";
import { SectioningEvent } from "./sectioningTypes";

export function selectLabwareType(
  labwareType: GetSectioningInfoQuery["labwareTypes"][number]
): SectioningEvent {
  return {
    type: "SELECT_LABWARE_TYPE",
    labwareType,
  };
}

export function addLabwareLayout(): SectioningEvent {
  return { type: "ADD_LABWARE_LAYOUT" };
}

export function deleteLabwareLayout(index: number): SectioningEvent {
  return {
    type: "DELETE_LABWARE_LAYOUT",
    index,
  };
}

export function prepDone(): SectioningEvent {
  return {
    type: "PREP_DONE",
  };
}

export function backToPrep(): SectioningEvent {
  return {
    type: "BACK_TO_PREP",
  };
}

export function confirmOperation(): SectioningEvent {
  return {
    type: "CONFIRM_OPERATION",
  };
}
