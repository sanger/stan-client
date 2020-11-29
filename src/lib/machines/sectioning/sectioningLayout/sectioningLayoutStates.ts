export enum SectioningLayoutState {
  PREP = "prep",
  VALID = "valid",
  INVALID = "invalid",
  ERROR = "error",
  EDITING_LAYOUT = "editingLayout",
  VALIDATING = "validating",
  CREATING = "creating",
  READY_TO_PRINT = "readyToPrint",
  PRINTING = "printing",
  READY_TO_REPRINT = "readyToReprint",
}

export interface SectioningLayoutSchema {
  states: {
    [SectioningLayoutState.PREP]: {
      states: {
        [SectioningLayoutState.VALID]: {};
        [SectioningLayoutState.INVALID]: {};
        [SectioningLayoutState.ERROR]: {};
      };
    };
    [SectioningLayoutState.EDITING_LAYOUT]: {};
    [SectioningLayoutState.VALIDATING]: {};
    [SectioningLayoutState.CREATING]: {};
    [SectioningLayoutState.READY_TO_PRINT]: {};
    [SectioningLayoutState.PRINTING]: {};
    [SectioningLayoutState.READY_TO_REPRINT]: {};
  };
}
