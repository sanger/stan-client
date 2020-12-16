export enum State {
  IDLE = "idle",
  NORMAL = "normal",
  NORMAL_FQ = "#labwareScanner.idle.normal",
  ERROR = "error",
  ERROR_FQ = "#labwareScanner.idle.error",
  SUCCESS = "success",
  SUCCESS_FQ = "#labwareScanner.idle.success",
  LOCKED = "locked",
  VALIDATING = "validating",
  SEARCHING = "searching",
}

/**
 * The states of a {@link labwareMachine}
 */
export interface LabwareSchema {
  states: {
    /**
     * Waiting for user input
     */
    [State.IDLE]: {
      states: {
        [State.NORMAL]: {};
        [State.ERROR]: {};
        [State.SUCCESS]: {};
      };
    };
    /**
     * No labware can be added or removed.
     */
    [State.LOCKED]: {};
    /**
     * Running the validator from {@link LabwareMachineContext}
     */
    [State.VALIDATING]: {};

    /**
     * Using the findLabwareByBarcode service to look up the labware
     */
    [State.SEARCHING]: {};
  };
}
