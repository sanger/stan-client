import { Interpreter, State, StateNode } from "xstate";
import {
  GetRegistrationInfoQuery,
  RegisterSectionsMutation,
  SectionRegisterRequest,
} from "../../../types/graphql";
import {
  LabwareTypeName,
  MachineServiceDone,
  MachineServiceError,
} from "../../../types/stan";
import { ApolloError } from "@apollo/client";

/**
 * Context for SlideRegistration Machine
 */
export interface SlideRegistrationContext {
  registrationInfo: GetRegistrationInfoQuery;
  initialLabwareType: LabwareTypeName;
  registrationResult: RegisterSectionsMutation;
  registrationErrors: ApolloError;
}

/**
 * State Schema for SlideRegistration Machine
 */
export interface SlideRegistrationSchema {
  states: {
    selectingInitialLabware: {};
    ready: {};
    submitting: {};
    submissionError: {};
    complete: {};
  };
}

type SelectInitialLabwareEvent = {
  type: "SELECT_INITIAL_LABWARE";
  labwareType: LabwareTypeName;
};

type SubmitFormEvent = { type: "SUBMIT_FORM"; values: SectionRegisterRequest };

type SubmittingDoneEvent = MachineServiceDone<
  "submitForm",
  RegisterSectionsMutation
>;
type SubmittingErrorEvent = MachineServiceError<"submitForm">;

export type SlideRegistrationEvent =
  | SelectInitialLabwareEvent
  | SubmitFormEvent
  | SubmittingDoneEvent
  | SubmittingErrorEvent;

/**
 * The type of an interpreted SlideRegistration Machine
 */
export type SlideRegistrationMachineService = Interpreter<
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent
>;

/**
 * SlideRegistration Machine type
 */
export type SlideRegistrationMachine = StateNode<
  SlideRegistrationContext,
  SlideRegistrationSchema,
  SlideRegistrationEvent
>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type SlideRegistrationState = State<
  SlideRegistrationContext,
  SlideRegistrationEvent,
  SlideRegistrationSchema
>;
