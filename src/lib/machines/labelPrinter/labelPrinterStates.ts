export enum State {
  INITIALISING = "init",
  FETCHING = "fetching",
  FETCH_ERROR = "fetchError",
  READY = "ready",
  PRINTING = "printing",
}

export interface LabelPrinterSchema {
  states: {
    [State.INITIALISING]: {};
    [State.FETCHING]: {};
    [State.FETCH_ERROR]: {};
    [State.READY]: {};
    [State.PRINTING]: {};
  };
}
