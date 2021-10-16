import { ExtractResult, PassFail } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../lib/sdk";
import React, { useCallback } from "react";

export interface AnalysisContext {
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
  AnalysisContext,
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
        on: {
          "": {
            actions: "assignBarcode",
            target: "ready",
          },
        },
      },
      extractResultSuccess: {
        on: { "": "ready" },
      },
      extractResultFailed: { on: { "": "ready" } },
    },
  },
  {
    actions: {
      assignBarcode: assign((ctx, e) => {
        debugger;
        if (!(e.type === "UPDATE_BARCODE" || e.type === "SUBMIT_BARCODE"))
          return;

        ctx.currentBarcode = e.barcode;
      }),
      assignSubmitBarcodeError: assign((ctx, e) => {
        debugger;
        if (e.type !== "SUBMIT_BARCODE") return;
        ctx.scanErrorMessage = `"${e.barcode}" has already been scanned`;
      }),
      assignExtractResult: assign((ctx, e) => {
        debugger;
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
      unassignServerError: assign((ctx, _e) => {
        ctx.serverError = undefined;
      }),
      unassignErrorMessage: assign((ctx, e) => {
        ctx.scanErrorMessage = "";
      }),
    },

    guards: {
      SubmitBarcodeValid: (ctx, e) => {
        debugger;
        return (
          ctx.extractResults.filter(
            (result) => result.labware.barcode === ctx.currentBarcode
          ).length <= 0
        );
      },
      SubmitBarcodeInvalid: (ctx, e) => {
        debugger;
        return (
          ctx.extractResults.filter(
            (result) => result.labware.barcode === ctx.currentBarcode
          ).length > 0
        );
      },
      ExtractResultNotEmpty: (ctx, e) =>
        ctx.extractResults && ctx.extractResults.length > 0,
    },
    services: {
      extractResult: (ctx, evt) => {
        debugger;
        return stanCore.ExtractResult({
          barcode: ctx.currentBarcode,
        });
      },
    },
  }
);
