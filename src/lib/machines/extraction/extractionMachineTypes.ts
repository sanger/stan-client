import { Interpreter, State, StateNode } from "xstate";
import { ExtractMutation, Labware } from "../../../types/graphql";
import { ApolloError } from "@apollo/client";

/**
 * Context for Extraction Machine
 */
export interface ExtractionContext {
  labwares: Labware[];
  extraction: ExtractMutation;
  serverErrors: ApolloError;
}

/**
 * State Schema for Extraction Machine
 */
export interface ExtractionSchema {
  states: {
    ready: {};
    extracting: {};
    extractionFailed: {};
    extracted: {};
  };
}

type UpdateLabwaresEvent = { type: "UPDATE_LABWARES"; labwares: Labware[] };
type ExtractEvent = { type: "EXTRACT" };
type ExtractDoneEvent = {
  type: "done.invoke.extract";
  data: ExtractMutation;
};
type ExtractErrorEvent = {
  type: "error.platform.extract";
  data: ApolloError;
};

export type ExtractionEvent =
  | UpdateLabwaresEvent
  | ExtractEvent
  | ExtractDoneEvent
  | ExtractErrorEvent;

/**
 * The type of an interpreted Extraction Machine
 */
export type ExtractionMachineService = Interpreter<
  ExtractionContext,
  ExtractionSchema,
  ExtractionEvent
>;

/**
 * Extraction Machine type
 */
export type ExtractionMachine = StateNode<
  ExtractionContext,
  ExtractionSchema,
  ExtractionEvent
>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type ExtractionState = State<
  ExtractionContext,
  ExtractionEvent,
  ExtractionSchema
>;
