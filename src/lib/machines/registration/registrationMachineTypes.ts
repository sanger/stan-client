import {
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
  RegisterTissuesMutationResult,
} from "../../../types/graphql";
import { ServerErrors } from "../../../types/stan";
import { ApolloError } from "@apollo/client";
import { FormValues } from "../../services/registrationService";
import { Interpreter, State, StateNode } from "xstate";

export type RegistrationMachineService = Interpreter<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
>;

export type RegistrationMachine = StateNode<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
>;

export interface RegistrationSchema {
  states: {
    ready: {};
    submitting: {};
    checkSubmissionClashes: {};
    clashed: {};
    submissionError: {};
    complete: {};
  };
}

export type RegistrationState = State<
  RegistrationContext,
  RegistrationEvent,
  RegistrationSchema
>;

export interface RegistrationContext {
  registrationInfo: GetRegistrationInfoQuery;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: ServerErrors;
  confirmedTissues: Array<string>;
}

type SubmitFormEvent = {
  type: "SUBMIT_FORM";
  values: FormValues;
};

type EditSubmissionEvent = {
  type: "EDIT_SUBMISSION";
};

type SubmittingDoneEvent = {
  type: "done.invoke.submitting";
  data: RegisterTissuesMutationResult;
};

type SubmittingErrorEvent = {
  type: "error.platform.submitting";
  data: ApolloError;
};

export type RegistrationEvent =
  | SubmitFormEvent
  | EditSubmissionEvent
  | SubmittingDoneEvent
  | SubmittingErrorEvent;
