import { FindLabwareQueryResult, Labware } from "../../../types/graphql";
import * as Yup from "yup";
import { ApolloError } from "@apollo/client";

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
