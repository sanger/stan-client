import { MachineConfig, MachineOptions } from "xstate";
import {
  ExtractionContext,
  ExtractionEvent,
  ExtractionSchema,
} from "./extractionMachineTypes";
import * as extractionService from "../../services/extractionService";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";
import { castDraft } from "immer";

/**
 * Extraction Machine Options
 */
const machineOptions: Partial<MachineOptions<
  ExtractionContext,
  ExtractionEvent
>> = {
  actions: {
    assignLabwares: assign((ctx, e) => {
      if (e.type !== "UPDATE_LABWARES") {
        return;
      }
      ctx.labwares = e.labwares;
    }),

    assignExtraction: assign((ctx, e) => {
      if (e.type !== "done.invoke.extract") {
        return;
      }
      ctx.extraction = e.data;
    }),

    assignServerErrors: assign((ctx, e) => {
      if (e.type !== "error.platform.extract") {
        return;
      }
      ctx.serverErrors = castDraft(e.data);
    }),
  },

  guards: {
    labwaresNotEmpty: (ctx, _e) => ctx.labwares.length > 0,
  },

  services: {
    extract: (ctx, _e) => {
      return extractionService.extract({
        labwareType: "Tube",
        barcodes: ctx.labwares.map((lw) => lw.barcode),
      });
    },
  },
};

/**
 * Extraction Machine Config
 */
export const machineConfig: MachineConfig<
  ExtractionContext,
  ExtractionSchema,
  ExtractionEvent
> = {
  id: "extraction",
  initial: "ready",
  states: {
    ready: {
      on: {
        UPDATE_LABWARES: { actions: "assignLabwares" },
        EXTRACT: { target: "extracting", cond: "labwaresNotEmpty" },
      },
    },
    extracting: {
      invoke: {
        src: "extract",
        onDone: {
          target: "extracted",
          actions: "assignExtraction",
        },
        onError: {
          target: "extractionFailed",
          actions: "assignServerErrors",
        },
      },
    },
    extractionFailed: {
      on: {
        EXTRACT: { target: "extracting", cond: "labwaresNotEmpty" },
      },
    },
    extracted: {},
  },
};

const createExtractionMachine = createMachineBuilder<
  ExtractionContext,
  ExtractionSchema,
  ExtractionEvent
>(machineConfig, machineOptions);

export default createExtractionMachine;
