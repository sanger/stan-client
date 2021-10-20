import { ExtractResult, PassFail } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../lib/sdk";
import { castDraft } from "immer";

export interface ExtractResultContext {
  extractResults: ExtractResult[];
  serverError?: ClientError;
  scanErrorMessage?: string;
  currentBarcode: string;
}

type SubmitBarcodeEvent = {
  type: "SUBMIT_BARCODE";
  barcode: string;
};
type UpdateBarcodeEvent = {
  type: "UPDATE_BARCODE";
  barcode: string;
};
type ExtractResultSuccess = {
  type: "done.invoke.extractResult";
  data: ExtractResult;
};
type ExtractResultFailure = {
  type: "error.platform.extractResult";
  data: ClientError;
};
type RemoveExtractResultEvent = {
  type: "REMOVE_EXTRACT_RESULT";
  barcode: string;
};

export type RNAAnalysisEvent =
  | SubmitBarcodeEvent
  | UpdateBarcodeEvent
  | ExtractResultSuccess
  | ExtractResultFailure
  | RemoveExtractResultEvent;

export const extractResultMachine = createMachine<
  ExtractResultContext,
  RNAAnalysisEvent
>(
  {
    id: "extract_result",
    initial: "ready",
    states: {
      ready: {
        on: {
          SUBMIT_BARCODE: [
            {
              target: "submitBarcodeSuccess",
              actions: "assignBarcode",
              cond: "SubmitBarcodeValid",
            },
            {
              target: "submitBarcodeFailed",
              cond: "SubmitBarcodeInvalid",
            },
          ],
          UPDATE_BARCODE: {
            actions: ["unassignErrorMessage", "assignBarcode"],
          },
          REMOVE_EXTRACT_RESULT: {
            cond: "ExtractResultNotEmpty",
            actions: "removeExtractResult",
          },
        },
      },
      submitBarcodeSuccess: {
        onEntry: ["unassignServerError", "unassignErrorMessage"],
        invoke: {
          src: "extractResult",
          onDone: {
            target: "extractResultSuccess",
            actions: "assignExtractResult",
          },
          onError: {
            target: "extractResultFailed",
            actions: "assignServerError",
          },
        },
      },
      submitBarcodeFailed: {
        entry: "assignSubmitBarcodeError",
        always: {
          actions: "assignBarcode",
          target: "ready",
        },
      },
      extractResultSuccess: {
        always: {
          target: "ready",
        },
      },
      extractResultFailed: {
        always: {
          target: "ready",
        },
      },
    },
  },
  {
    actions: {
      assignBarcode: assign((ctx, e) => {
        if (!(e.type === "UPDATE_BARCODE" || e.type === "SUBMIT_BARCODE"))
          return;

        ctx.currentBarcode = e.barcode;
      }),
      assignSubmitBarcodeError: assign((ctx, e) => {
        if (e.type !== "SUBMIT_BARCODE") return;
        ctx.scanErrorMessage = `"${e.barcode}" has already been scanned`;
      }),
      assignExtractResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.extractResult") return;
        if (e.data.result === PassFail.Fail) {
          ctx.scanErrorMessage = "Extraction result failed for tube!";
          return;
        }
        ctx.extractResults.push(e.data);
        ctx.currentBarcode = "";
      }),
      removeExtractResult: assign((ctx, e) => {
        if (e.type !== "REMOVE_EXTRACT_RESULT") return;
        ctx.extractResults = ctx.extractResults.filter(
          (res) => res.labware.barcode !== e.barcode
        );
      }),
      assignServerError: assign((ctx, e) => {
        if (e.type !== "error.platform.extractResult") return;
        ctx.serverError = castDraft(e.data);
      }),
      unassignServerError: assign((ctx, _e) => {
        ctx.serverError = undefined;
      }),
      unassignErrorMessage: assign((ctx) => {
        ctx.scanErrorMessage = "";
      }),
    },

    guards: {
      SubmitBarcodeValid: (ctx) => {
        return (
          ctx.extractResults.filter(
            (result) => result.labware.barcode === ctx.currentBarcode
          ).length <= 0
        );
      },
      SubmitBarcodeInvalid: (ctx) => {
        return (
          ctx.extractResults.filter(
            (result) => result.labware.barcode === ctx.currentBarcode
          ).length > 0
        );
      },
      ExtractResultNotEmpty: (ctx) =>
        ctx.extractResults && ctx.extractResults.length > 0,
    },
    services: {
      extractResult: (ctx) => {
        return stanCore.ExtractResult({
          barcode: ctx.currentBarcode,
        });
      },
    },
  }
);
