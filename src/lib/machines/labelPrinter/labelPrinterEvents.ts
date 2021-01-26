import { GetPrintersQueryResult } from "../../../types/graphql";
import { LabelPrinter } from "./labelPrinterContext";

type InitEvent = { type: "INIT" };
export function init(): InitEvent {
  return { type: "INIT" };
}

type PrintEvent = { type: "PRINT" };
export function print(): PrintEvent {
  return { type: "PRINT" };
}

export type UpdateLabelPrinterEvent = {
  type: "UPDATE_LABEL_PRINTER";
  labelPrinter: Partial<LabelPrinter>;
};
export function updateLabelPrinter(
  labelPrinter: Partial<LabelPrinter>
): UpdateLabelPrinterEvent {
  return {
    type: "UPDATE_LABEL_PRINTER",
    labelPrinter,
  };
}

type FetchPrintersDoneEvent = {
  type: "done.invoke.fetchPrinters";
  data: GetPrintersQueryResult;
};

type UpdateSelectedLabelPrinterEvent = {
  type: "UPDATE_SELECTED_LABEL_PRINTER";
  name: string;
};
export function updateSelectedLabelPrinter(
  name: string
): UpdateSelectedLabelPrinterEvent {
  return {
    type: "UPDATE_SELECTED_LABEL_PRINTER",
    name,
  };
}

export type PrintSuccessEvent = {
  type: "PRINT_SUCCESS";
  message: string;
  labelPrinter: LabelPrinter;
};
export function printSuccess(
  labelPrinter: LabelPrinter,
  message: string
): PrintSuccessEvent {
  return {
    type: "PRINT_SUCCESS",
    labelPrinter,
    message,
  };
}

export type PrintErrorEvent = {
  type: "PRINT_ERROR";
  message: string;
  labelPrinter: LabelPrinter;
};
export function printError(
  labelPrinter: LabelPrinter,
  message: string
): PrintErrorEvent {
  return {
    type: "PRINT_ERROR",
    labelPrinter,
    message,
  };
}

export type LabelPrinterEvents =
  | InitEvent
  | UpdateLabelPrinterEvent
  | PrintEvent
  | FetchPrintersDoneEvent
  | UpdateSelectedLabelPrinterEvent;
