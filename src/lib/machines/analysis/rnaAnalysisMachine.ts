import {
  ExtractResultQuery,
  LabwareFieldsFragment,
  RecordRnaAnalysisMutation,
  RnaAnalysisRequest,
} from "../../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../sdk";
import { castDraft } from "immer";

export interface AnalysisContext {
  labware: LabwareFieldsFragment | undefined;
  extractionResult: ExtractResultQuery[];
  analysisRequest?: RnaAnalysisRequest;
  analysis?: RecordRnaAnalysisMutation;
  serverErrors?: ClientError;
}

type UpdateLabwaresEvent = {
  type: "UPDATE_LABWARES";
  labware: LabwareFieldsFragment;
};
type ExtractionResultSuccess = {
  type: "done.invoke.extractresult";
  data: ExtractResultQuery;
};
type ExtractionResultFailure = {
  type: "error.platform.extractresult";
  data: ClientError;
};

type AnalyseEvent = {
  type: "ANALYSE";
  data: RnaAnalysisRequest;
};
type AnalyseDoneEvent = {
  type: "done.invoke.analyse";
  data: RecordRnaAnalysisMutation;
};
type AnalyseErrorEvent = {
  type: "error.platform.analysis";
  data: ClientError;
};

export type RNAAnalysisEvent =
  | UpdateLabwaresEvent
  | ExtractionResultSuccess
  | ExtractionResultFailure
  | AnalyseEvent
  | AnalyseDoneEvent
  | AnalyseErrorEvent;

export const rnaAnalysisMachine = createMachine<
  AnalysisContext,
  RNAAnalysisEvent
>(
  {
    id: "rna_analysis",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_LABWARES: { target: "updatingLabware" },
        },
      },
      updatingLabware: {
        invoke: {
          src: "extractResult",
          onDone: {
            target: "extractionResultSuccess",
            actions: "assignExtractionResult",
          },
          onError: {
            target: "extractionResultFailure",
            actions: "assignServerError",
          },
        },
      },
      extractionResultSuccess: {
        on: {
          ANALYSE: {
            target: "recordingAnalysis",
            cond: "ExtractionResultNotEmpty",
          },
        },
      },
      extractionResultFailure: {
        on: {
          ANALYSE: {
            target: "recordingAnalysis",
            cond: "ExtractionResultNotEmpty",
          },
        },
      },
      recordingAnalysis: {
        invoke: {
          src: "recordAnalysis",
          onDone: {
            target: "ready",
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
      assignExtractionResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.extractresult") return;
        debugger;
        ctx.extractionResult.push(e.data);
      }),
      assignedAnalyseData: assign((ctx, e) => {}),
      assignServerErrors: assign((ctx, e) => {
        if (e.type !== "error.platform.analysis") {
          return;
        }
        ctx.serverErrors = castDraft(e.data);
      }),
    },

    guards: {
      ExtractionResultNotEmpty: (ctx, e) =>
        ctx.extractionResult && ctx.extractionResult.length > 0,
    },
    services: {
      extractResult: (ctx, evt) => {
        debugger;
        return stanCore.ExtractResult({
          barcode: ctx.labware!.barcode,
        });
      },
      recordAnalysis: (ctx, evt) => {
        return stanCore.RecordRNAAnalysis({
          request: ctx.analysisRequest!,
        });
      },
    },
  }
);
