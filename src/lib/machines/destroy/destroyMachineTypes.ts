import { Interpreter, State, StateNode } from "xstate";
import {
  DestroyMutation,
  DestroyRequest,
  GetDestroyInfoQuery,
  Maybe,
} from "../../../types/graphql";
import { MachineServiceDone, MachineServiceError } from "../../../types/stan";
import { ApolloError } from "@apollo/client";

/**
 * Context for Destroy Machine
 */
export interface DestroyContext {
  destroyInfo: GetDestroyInfoQuery;
  destroyResult: DestroyMutation;
  serverError: Maybe<ApolloError>;
}

/**
 * State Schema for Destroy Machine
 */
export interface DestroySchema {
  states: {
    ready: {};
    destroying: {};
    destroyed: {};
  };
}

type SubmitEvent = { type: "SUBMIT"; request: DestroyRequest };

export type DestroyEvent =
  | SubmitEvent
  | MachineServiceDone<"destroy", DestroyMutation>
  | MachineServiceError<"destroy">;

/**
 * The type of an interpreted Destroy Machine
 */
export type DestroyMachineService = Interpreter<
  DestroyContext,
  DestroySchema,
  DestroyEvent
>;

/**
 * Destroy Machine type
 */
export type DestroyMachine = StateNode<
  DestroyContext,
  DestroySchema,
  DestroyEvent
>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type DestroyState = State<DestroyContext, DestroyEvent, DestroySchema>;
