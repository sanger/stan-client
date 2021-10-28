import {
  ExtractResult,
  PassFail,
  RecordRnaAnalysisMutation,
  RnaAnalysisRequest,
} from "../../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../sdk";
import { castDraft } from "immer";

export interface AnalysisContext {
  extractResults: ExtractResult[];
  analysis?: RecordRnaAnalysisMutation;
  serverError?: ClientError;
  scanErrorMessage?: string;
}

type ScanLabwareEvent = {
  type: "SCAN_LABWARE";
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

type AnalysisEvent = {
  type: "ANALYSIS";
  data: RnaAnalysisRequest;
};
type AnalysisDoneEvent = {
  type: "done.invoke.analysis";
  data: RecordRnaAnalysisMutation;
};
type AnalysisErrorEvent = {
  type: "error.platform.analysis";
  data: ClientError;
};

export type RNAAnalysisEvent =
  | ScanLabwareEvent
  | ExtractResultSuccess
  | ExtractResultFailure
  | RemoveExtractResultEvent
  | AnalysisEvent
  | AnalysisDoneEvent
  | AnalysisErrorEvent;

export const analysisMachine = createMachine<AnalysisContext, RNAAnalysisEvent>(
  {
    id: "rna_analysis",
    initial: "ready",
    states: {
      ready: {
        on: {
          SCAN_LABWARE: { target: "scanningLabware" },
        },
      },
      scanningLabware: {
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
      extractResultSuccess: {
        on: {
          SCAN_LABWARE: { target: "scanningLabware" },
          REMOVE_EXTRACT_RESULT: { actions: "removeExtractResult" },
          ANALYSIS: {
            target: "recordingAnalysis",
            cond: "ExtractResultNotEmpty",
          },
        },
      },
      extractResultFailed: {
        on: {
          SCAN_LABWARE: {
            target: "scanningLabware",
          },
        },
      },

      recordingAnalysis: {
        onEntry: ["unassignServerError"],
        invoke: {
          src: "recordAnalysis",
          onDone: {
            //final done state
            actions: "assignedAnalyseData",
          },
          onError: {
            target: "ready",
            actions: "assignServerError",
          },
        },
      },
    },
  },
  {
    actions: {
      assignExtractResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.extractResult") return;
        if (e.data.result === PassFail.Fail) {
          ctx.scanErrorMessage = "Extraction result failed for tube!";
          return;
        }
        ctx.extractResults.push(e.data);
      }),
      removeExtractResult: assign((ctx, e) => {
        if (e.type !== "REMOVE_EXTRACT_RESULT") return;
        ctx.extractResults = ctx.extractResults.filter(
          (res) => res.labware.barcode !== e.barcode
        );
      }),
      assignedAnalyseData: assign((ctx, e) => {
        if (e.type !== "done.invoke.analysis") return;
        ctx.analysis = e.data;
      }),
      assignServerErrors: assign((ctx, e) => {
        if (
          !(
            e.type === "error.platform.analysis" ||
            e.type === "error.platform.extractResult"
          )
        ) {
          return;
        }
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
      ExtractResultNotEmpty: (ctx) =>
        ctx.extractResults && ctx.extractResults.length > 0,
    },
    services: {
      extractResult: (ctx, evt) =>
        new Promise((resolve, reject) => {
          if (evt.type !== "SCAN_LABWARE") return reject("Invalid event");
          return resolve(
            stanCore.ExtractResult({
              barcode: evt.barcode,
            })
          );
        }),
      recordAnalysis: (ctx, evt) =>
        new Promise((resolve, reject) => {
          if (evt.type !== "ANALYSIS") return reject("Invalid event");
          return stanCore.RecordRNAAnalysis({
            request: evt.data,
          });
        }),
    },
  }
);
