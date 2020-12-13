export enum State {
  LOADING = "loading",
  UNKNOWN = "unknown",
  ERROR = "error",
  READY = "ready",
  STARTED = "started",
  SOURCE_SCANNING = "sourceScanning",
  PREPARING_LABWARE = "preparingLabware",
  OUTCOMES = "outcome",
}

export interface SectioningSchema {
  states: {
    [State.LOADING]: {};
    [State.UNKNOWN]: {};
    [State.ERROR]: {};
    [State.READY]: {};
    [State.STARTED]: {
      states: {
        [State.SOURCE_SCANNING]: {};
        [State.PREPARING_LABWARE]: {};
      };
    };
    [State.OUTCOMES]: {};
  };
}
