export enum State {
  READY = "ready",
  SOURCE_NOT_SELECTED = "sourceNotSelected",
  SOURCE_SELECTED = "sourceSelected",
}

export interface LayoutSchema {
  states: {
    [State.READY]: {
      states: {
        [State.SOURCE_NOT_SELECTED]: {};
        [State.SOURCE_SELECTED]: {};
      };
    };
  };
}
