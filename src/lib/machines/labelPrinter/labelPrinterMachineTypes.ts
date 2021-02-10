import {
  GetPrintersQuery,
  LabelType,
  Labware,
  Maybe,
} from "../../../types/graphql";
import { Interpreter, State, StateNode } from "xstate";
import { ApolloError } from "@apollo/client";

export interface LabelPrinterContext {
  /**
   * Printers from the GetPrinters query
   */
  printers: GetPrintersQuery["printers"];

  /**
   * Error message from core
   */
  serverErrors: ApolloError;

  /**
   * The currently selected printer
   */
  selectedPrinter: Maybe<GetPrintersQuery["printers"][number]>;

  /**
   * The list of labwares with their labware types, and their labware type's label type (if they have one)
   */
  labwares: Array<
    Pick<Labware, "barcode"> & {
      labwareType: {
        labelType?: Maybe<Pick<LabelType, "name">>;
      };
    }
  >;

  /**
   * Number of labels to print off for each barcode
   */
  labelsPerBarcode: number;
}

/**
 * State Schema for a LabelPrinter Machine
 */
export interface LabelPrinterSchema {
  states: {
    init: {};
    fetching: {};
    error: {};
    ready: {
      states: {
        idle: {};
        printSuccess: {};
        printError: {};
      };
    };
    printing: {};
  };
}

type FetchPrintersDoneEvent = {
  type: "done.invoke.fetchPrinters";
  data: GetPrintersQuery;
};

type FetchPrintersErrorEvent = {
  type: "error.platform.fetchPrinters";
  data: ApolloError;
};

type PrintEvent = { type: "PRINT" };

type UpdateSelectedLabelPrinterEvent = {
  type: "UPDATE_SELECTED_LABEL_PRINTER";
  name: string;
};

export type PrintSuccessEvent = {
  type: "PRINT_SUCCESS";
  message: string;
  labelPrinter: GetPrintersQuery["printers"][number];
};

export type PrintErrorEvent = {
  type: "PRINT_ERROR";
  message: string;
  labelPrinter: GetPrintersQuery["printers"][number];
};

export type LabelPrinterEvent =
  | FetchPrintersDoneEvent
  | FetchPrintersErrorEvent
  | PrintEvent
  | UpdateSelectedLabelPrinterEvent
  | PrintSuccessEvent
  | PrintErrorEvent;

/**
 * Type of an interpreted LabelPrinter Machine
 */
type LabelPrinterMachineType = Interpreter<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvent
>;

/**
 * Type for a LabelPrinter Machine
 */
export type LabelPrinterMachine = StateNode<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvent
>;
