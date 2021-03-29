import { MachineConfig, MachineOptions } from "xstate";
import {
  LabelPrinterContext,
  LabelPrinterEvent,
  LabelPrinterSchema,
} from "./labelPrinterMachineTypes";
import { find } from "lodash";
import { assign } from "@xstate/immer";
import * as printService from "../../services/printService";
import { createMachineBuilder } from "../index";
import { getPrinters } from "../../services/printService";
import { castDraft } from "immer";

/**
 * LabelPrinter Machine Options
 */
export const machineOptions: Partial<MachineOptions<
  LabelPrinterContext,
  LabelPrinterEvent
>> = {
  actions: {
    assignPrinters: assign((ctx, e) => {
      if (e.type !== "done.invoke.fetchPrinters") {
        return;
      }

      const labwareLabelTypes = new Set(
        ctx.labwares.map((lw) => lw.labwareType?.labelType?.name)
      );

      // Only have available printers of the labwares' label type (if there is one)
      ctx.printers = e.data.printers.filter((printer) =>
        printer.labelTypes.some((lt) => labwareLabelTypes.has(lt.name))
      );
      ctx.selectedPrinter = ctx.printers[0];
    }),

    assignServerErrors: assign((ctx, e) => {
      if (e.type !== "error.platform.fetchPrinters") {
        return;
      }
      ctx.serverErrors = castDraft(e.data);
    }),

    assignLabelPrinter: assign((ctx, e) => {
      if (e.type === "UPDATE_SELECTED_LABEL_PRINTER") {
        ctx.selectedPrinter =
          find(ctx.printers, (printer) => printer.name === e.name) ?? null;
      }
    }),
  },

  guards: {
    labelPrinterAssigned: (ctx, _e) => !!ctx.selectedPrinter,
  },

  services: {
    fetchPrinters: () => getPrinters(),

    printLabels: (ctx, e) => {
      if (!ctx.selectedPrinter) {
        return Promise.reject("No selected printer");
      }

      let labelsPerBarcode = 1;
      if (e.type === "PRINT" && e.labelsPerBarcode) {
        labelsPerBarcode = e.labelsPerBarcode;
      }

      return printService.printLabels({
        printer: ctx.selectedPrinter.name,
        barcodes: ctx.labwares
          .map((lw) => new Array(labelsPerBarcode).fill(lw.barcode))
          .flat(),
      });
    },
  },
};

/**
 * LabelPrinter Machine Config
 */
export const machineConfig: MachineConfig<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvent
> = {
  id: "labelPrinter",
  initial: "init",
  states: {
    init: {
      always: [
        // Go to ready if there's already a pre-selected label printer (used for LabelPrinterButton)
        { target: "ready", cond: "labelPrinterAssigned" },
        { target: "fetching" },
      ],
    },
    fetching: {
      invoke: {
        src: "fetchPrinters",
        onDone: {
          target: "ready",
          actions: "assignPrinters",
        },
        onError: {
          target: "error",
          actions: "assignServerErrors",
        },
      },
    },
    error: {},
    ready: {
      initial: "idle",
      states: {
        idle: {},
        printSuccess: {},
        printError: {},
      },
      on: {
        UPDATE_SELECTED_LABEL_PRINTER: {
          actions: ["assignLabelPrinter"],
          target: ".idle",
        },
        PRINT: {
          target: "printing",
        },
      },
    },
    printing: {
      invoke: {
        src: "printLabels",
        onDone: {
          target: "ready.printSuccess",
        },
        onError: {
          target: "ready.printError",
          actions: ["assignServerErrors"],
        },
      },
    },
  },
};

const createLabelPrinterMachine = createMachineBuilder<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvent
>(machineConfig, machineOptions);

export default createLabelPrinterMachine;
