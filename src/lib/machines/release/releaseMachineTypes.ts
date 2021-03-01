import { Interpreter, State, StateNode } from "xstate";
import {
  Maybe,
  ReleaseLabwareMutation,
  ReleaseRequest,
} from "../../../types/graphql";
import { ApolloError } from "@apollo/client";
import { ServerErrors } from "../../../types/stan";

/**
 * Context for Release Machine
 */
export interface ReleaseContext {
  destinations: Array<string>;
  recipients: Array<string>;
  releaseResult: ReleaseLabwareMutation;
  serverError?: ApolloError;
}

/**
 * State Schema for Release Machine
 */
export interface ReleaseSchema {
  states: {
    ready: {};
    submitting: {};
    submitted: {};
  };
}

type SubmitEvent = { type: "SUBMIT"; formValues: ReleaseRequest };
type ReleaseDoneEvent = {
  type: "done.invoke.releaseLabware";
  data: ReleaseLabwareMutation;
};
type ReleaseErrorEvent = {
  type: "error.platform.releaseLabware";
  data: ApolloError;
};

export type ReleaseEvent = SubmitEvent | ReleaseDoneEvent | ReleaseErrorEvent;

/**
 * The type of an interpreted Release Machine
 */
export type ReleaseMachineService = Interpreter<
  ReleaseContext,
  ReleaseSchema,
  ReleaseEvent
>;

/**
 * Release Machine type
 */
export type ReleaseMachine = StateNode<
  ReleaseContext,
  ReleaseSchema,
  ReleaseEvent
>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type ReleaseState = State<ReleaseContext, ReleaseEvent, ReleaseSchema>;
