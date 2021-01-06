export enum State {
  LOADING = "loading",
  FETCHING_REGISTRATION_INFO = "fetchingRegistrationInfo",
  FETCHING_FINISHED = "finished",
  LOADED = "loaded",
  ERROR = "error",
  ERROR_FQ = "#registration.error",
  SUBMITTING = "submitting",
  SUBMISSION_ERROR = "submissionError",
  COMPLETE = "complete",
}

export interface RegistrationSchema {
  states: {
    [State.LOADING]: {};
    [State.LOADED]: {};
    [State.ERROR]: {};
    [State.SUBMITTING]: {};
    [State.SUBMISSION_ERROR]: {};
    [State.COMPLETE]: {};
  };
}
