export enum SectioningLayoutState {
  PREP = "prep",
  VALID = "valid",
  INVALID = "invalid",
  ERROR = "error",
  EDITING_LAYOUT = "editingLayout",
  VALIDATING = "validating",
  CREATING = "creating",
  PRINTING = "printing",
  READY_TO_PRINT = "readyToPrint",
  PRINT_SUCCESS = "printSuccess",
  PRINT_ERROR = "printError",
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
    [SectioningLayoutState.PRINTING]: {
      states: {
        [SectioningLayoutState.READY_TO_PRINT]: {};
        [SectioningLayoutState.PRINT_SUCCESS]: {};
        [SectioningLayoutState.PRINT_ERROR]: {};
      };
    };
  };
}
