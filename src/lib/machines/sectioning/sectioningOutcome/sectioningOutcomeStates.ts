export enum State {
  READY = "ready",
  EDITING_LAYOUT = "editingLayout",
}

export interface SectioningOutcomeSchema {
  states: {
    [State.READY]: {};
    [State.EDITING_LAYOUT]: {};
  };
}
