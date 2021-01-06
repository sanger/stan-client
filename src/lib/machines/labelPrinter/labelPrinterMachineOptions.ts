import { MachineOptions, sendParent } from "xstate";
import { assign } from "@xstate/immer";
import { LabelPrinterContext } from "./labelPrinterContext";
import {
  LabelPrinterEvents,
  printError,
  PrintErrorEvent,
  printSuccess,
  PrintSuccessEvent,
} from "./labelPrinterEvents";
import printService from "../../services/printService";
import { find } from "lodash";

export enum Actions {
  ASSIGN_LABEL_PRINTER = "assignLabelPriner",
  NOTIFY_PARENT_SUCCESS = "notifyParentSuccess",
  NOTIFY_PARENT_ERROR = "notifyParentError",
}

export enum Activities {}

export enum Delays {}

export enum Guards {
  SHOULD_FETCH_PRINTERS = "shouldFetchPrinters",
}

export enum Services {
  FETCH_PRINTERS = "fetchPrinters",
  PRINT_LABELS = "printLabels",
}

export const labelPrinterMachineOptions: Partial<MachineOptions<
  LabelPrinterContext,
  LabelPrinterEvents
>> = {
  actions: {
    [Actions.ASSIGN_LABEL_PRINTER]: assign((ctx, e) => {
      if (e.type === "done.invoke.fetchPrinters" && e.data.data) {
        const availableLabelTypes = new Set(
          ctx.labelPrinter.labwares.map((lw) => lw.labwareType?.labelType?.name)
        );
        ctx.labelPrinter.printers = e.data.data.printers.filter((printer) =>
          availableLabelTypes.has(printer.labelType.name)
        );
        ctx.labelPrinter.selectedPrinter = ctx.labelPrinter.printers[0];
      }

      if (e.type === "UPDATE_SELECTED_LABEL_PRINTER") {
        ctx.labelPrinter.selectedPrinter = find(
          ctx.labelPrinter.printers,
          (printer) => printer.name === e.name
        );
      }

      if (e.type === "UPDATE_LABEL_PRINTER") {
        ctx.labelPrinter = Object.assign({}, ctx.labelPrinter, e.labelPrinter);
      }
    }),

    [Actions.NOTIFY_PARENT_SUCCESS]: sendParent<
      LabelPrinterContext,
      LabelPrinterEvents,
      PrintSuccessEvent
    >((ctx) => printSuccess(ctx.labelPrinter)),

    [Actions.NOTIFY_PARENT_ERROR]: sendParent<
      LabelPrinterContext,
      LabelPrinterEvents,
      PrintErrorEvent
    >((ctx) => printError(ctx.labelPrinter)),
  },
  activities: {},
  delays: {},
  guards: {
    [Guards.SHOULD_FETCH_PRINTERS]: (ctx) => ctx.options.fetchPrinters,
  },
  services: {
    [Services.FETCH_PRINTERS]: printService.getPrinters,
    [Services.PRINT_LABELS]: (ctx) => {
      if (!ctx.labelPrinter.selectedPrinter) {
        return Promise.reject("No selected printer");
      }

      return printService.printLabels({
        printer: ctx.labelPrinter.selectedPrinter.name,
        barcodes: ctx.labelPrinter.labwares.map((lw) => lw.barcode),
      });
    },
  },
};
