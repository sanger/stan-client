export enum State {
  READY = "ready",
  SOURCE_NOT_SELECTED = "sourceNotSelected",
  SOURCE_SELECTED = "sourceSelected",
}

export interface LayoutSchema {
  states: {
    ready: {
      states: {
        sourceNotSelected: {};
        sourceSelected: {};
      };
    };
  };
}
