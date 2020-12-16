export enum State {
  LOADING = "loading",
  FETCHING_REGISTRATION_INFO = "fetchingRegistrationInfo",
  FETCHING = "fetching",
  FETCHING_FINISHED = "finished",
  MINIMUM_WAIT = "minimumWait",
  WAITING = "waiting",
  MINIMUM_WAIT_FINISHED = "finished",
  LOADED = "loaded",
  ERROR = "error",
  ERROR_FQ = "#registration.error",
  SUBMITTING = "submitting",
  SUBMISSION_ERROR = "submissionError",
  COMPLETE = "complete",
}

export interface RegistrationSchema {
  states: {
    [State.LOADING]: {
      states: {
        [State.FETCHING_REGISTRATION_INFO]: {
          states: {
            [State.FETCHING]: {};
            [State.FETCHING_FINISHED]: {};
          };
        };
        [State.MINIMUM_WAIT]: {
          states: {
            [State.WAITING]: {};
            [State.MINIMUM_WAIT_FINISHED]: {};
          };
        };
      };
    };
    [State.LOADED]: {};
    [State.ERROR]: {};
    [State.SUBMITTING]: {};
    [State.SUBMISSION_ERROR]: {};
    [State.COMPLETE]: {};
  };
}
