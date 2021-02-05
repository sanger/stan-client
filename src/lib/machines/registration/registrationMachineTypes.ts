import {
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
  RegisterTissuesMutationResult,
} from "../../../types/graphql";
import * as Yup from "yup";
import { LabwareTypeName, ServerErrors } from "../../../types/stan";
import { LabelPrinterActorRef } from "../labelPrinter";
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
  availableLabwareTypes: LabwareTypeName[];
  registrationSchema: Yup.ObjectSchema;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: ServerErrors;
  labelPrinterRef: LabelPrinterActorRef;
}

type SubmitFormEvent = { type: "SUBMIT_FORM"; values: FormValues };

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
  | SubmittingDoneEvent
  | SubmittingErrorEvent;
