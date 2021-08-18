import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";
import { ExtractMutation, LabwareFieldsFragment } from "../../../types/sdk";
import { ClientError } from "graphql-request";
import { stanCore } from "../../sdk";

export interface ExtractionContext {
  workNumber?: string;
  labwares: LabwareFieldsFragment[];
  extraction?: ExtractMutation;
  serverErrors?: ClientError;
}

type UpdateLabwaresEvent = {
  type: "UPDATE_LABWARES";
  labwares: LabwareFieldsFragment[];
};
type ExtractEvent = { type: "EXTRACT" };
type ExtractDoneEvent = {
  type: "done.invoke.extract";
  data: ExtractMutation;
};
type ExtractErrorEvent = {
  type: "error.platform.extract";
  data: ClientError;
};

export type ExtractionEvent =
  | { type: "UPDATE_WORK_NUMBER"; workNumber?: string }
  | UpdateLabwaresEvent
  | ExtractEvent
  | ExtractDoneEvent
  | ExtractErrorEvent;

export const extractionMachine = createMachine<
  ExtractionContext,
  ExtractionEvent
>(
  {
    id: "extraction",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: { actions: "assignWorkNumber" },
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
  },
  {
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

      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") return;
        ctx.workNumber = e.workNumber;
      }),
    },

    guards: {
      labwaresNotEmpty: (ctx, _e) => ctx.labwares.length > 0,
    },

    services: {
      extract: (ctx, _e) => {
        return stanCore.Extract({
          request: {
            workNumber: ctx.workNumber,
            labwareType: "Tube",
            barcodes: ctx.labwares.map((lw) => lw.barcode),
          },
        });
      },
    },
  }
);

export default extractionMachine;
