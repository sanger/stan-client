import { ActorRef, Interpreter } from "xstate";
import * as Yup from "yup";
import { Labware, Maybe } from "../../../types/graphql";
import { ApolloError } from "@apollo/client";

export type LabwareMachineType = Interpreter<
  LabwareContext,
  LabwareSchema,
  LabwareEvents
>;

export type LabwareMachineActorRef = ActorRef<
  LabwareEvents,
  LabwareMachineType["state"]
>;

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

/**
 * Context for a {@link labwareMachine}.
 */
export interface LabwareContext {
  /**
   * The current barcode we're working with
   */
  currentBarcode: string;

  /**
   * The list of sourceLabwares fetched so far
   */
  labwares: Labware[];

  /**
   * A {@link https://github.com/jquense/yup#string Yup string schema} to validate the barcode on submission
   */
  validator: Yup.StringSchema;

  /**
   * The current success message
   */
  successMessage: Maybe<string>;

  /**
   * The current error message
   */
  errorMessage: Maybe<string>;
}

/**
 * Event to be called whenever the barcode changes
 */
type UpdateCurrentBarcodeEvent = {
  type: "UPDATE_CURRENT_BARCODE";
  value: string;
};

/**
 * Event to be called when current barcode is to be submitted
 */
type SubmitBarcodeEvent = { type: "SUBMIT_BARCODE" };

/**
 * Event to be called to remove a piece of labware from context
 */
type RemoveLabwareEvent = { type: "REMOVE_LABWARE"; value: string };

/**
 * Event to be called when machine is to be locked
 */
type LockEvent = { type: "LOCK" };

/**
 * Event to unlock the machine
 */
type UnlockEvent = { type: "UNLOCK" };

export type UpdateLabwaresEvent = {
  type: "UPDATE_LABWARES";
  labwares: Labware[];
};

type ValidationErrorEvent = {
  type: "error.platform.validateBarcode";
  data: Yup.ValidationError;
};

type FindLabwareDoneEvent = {
  type: "done.invoke.findLabware";
  data: Labware;
};

type FindLabwareErrorEvent = {
  type: "error.platform.findLabware";
  data: ApolloError;
};

/**
 * All the Events for {@link labwareMachine}
 */
export type LabwareEvents =
  | UpdateCurrentBarcodeEvent
  | SubmitBarcodeEvent
  | RemoveLabwareEvent
  | LockEvent
  | UnlockEvent
  | ValidationErrorEvent
  | FindLabwareDoneEvent
  | FindLabwareErrorEvent;
