import {
  SectioningLayout,
  SectioningLayoutEvent,
} from "./sectioningLayoutTypes";

export function updateSectioningLayout(
  sectioningLayout: Partial<SectioningLayout>
): SectioningLayoutEvent {
  return {
    type: "UPDATE_SECTIONING_LAYOUT",
    sectioningLayout,
  };
}

export function editLayout(): SectioningLayoutEvent {
  return { type: "EDIT_LAYOUT" };
}

export function cancelEditLayout(): SectioningLayoutEvent {
  return { type: "CANCEL_EDIT_LAYOUT" };
}

export function doneEditLayout(): SectioningLayoutEvent {
  return { type: "DONE_EDIT_LAYOUT" };
}

export function createLabware(): SectioningLayoutEvent {
  return { type: "CREATE_LABWARE" };
}

export function prepComplete(): SectioningLayoutEvent {
  return { type: "PREP_COMPLETE" };
}
