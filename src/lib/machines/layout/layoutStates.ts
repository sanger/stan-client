export enum State {
  INIT = "init",
  SOURCE_DEST_MODE = "sourceDestMode",
  DEST_ONLY_MODE = "destOnlyMode",
  SOURCE_NOT_SELECTED = "sourceNotSelected",
  SOURCE_SELECTED = "sourceSelected",
  DONE = "done",
  CANCELLED = "cancelled",
}

export interface LayoutSchema {
  states: {
    [State.INIT]: {};
    [State.SOURCE_DEST_MODE]: {
      states: {
        [State.SOURCE_NOT_SELECTED]: {};
        [State.SOURCE_SELECTED]: {};
      };
    };
    [State.DEST_ONLY_MODE]: {};
    [State.DONE]: {};
    [State.CANCELLED]: {};
  };
}
