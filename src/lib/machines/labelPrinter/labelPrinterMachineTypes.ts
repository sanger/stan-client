import {
  GetPrintersQuery,
  LabwareFieldsFragment,
  Maybe,
  PrinterFieldsFragment,
} from "../../../types/graphql";
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
  selectedPrinter: Maybe<PrinterFieldsFragment>;

  /**
   * The list of labwares with their labware types, and their labware type's label type (if they have one)
   */
  labwares: Array<LabwareFieldsFragment>;
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

type PrintEvent = { type: "PRINT"; labelsPerBarcode?: number };

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
