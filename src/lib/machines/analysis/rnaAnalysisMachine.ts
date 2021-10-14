import {
  ExtractResultQuery,
  LabwareFieldsFragment,
  RecordRnaAnalysisMutation,
} from "../../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../sdk";
import {ExtractionResultType} from "../../../pages/RnaAnalysis";

export interface AnalysisContext {
  workNumber?: string;
  labwares: LabwareFieldsFragment[];
  extractionResult?: ExtractionResultType[];
  analysis?: RecordRnaAnalysisMutation;
  serverErrors?: ClientError;
}

type UpdateLabwaresEvent = {
  type: "UPDATE_LABWARES";
  labwares: LabwareFieldsFragment[];
};
type UpdateWorkNumberEvent = {
  type: "UPDATE_WORK_NUMBER";
  workNumber?: string;
};
type AnalyseInitEvent = {
  type: "ANALYSE_INITIALIZE";
};
type AnalyseDoneEvent = {
  type: "done.invoke.analyse";
  data: RecordRnaAnalysisMutation;
};
type AnalyseErrorEvent = {
  type: "error.platform.analyse";
  data: ClientError;
};

export type AnalysisEvent =
  | UpdateWorkNumberEvent
  | UpdateLabwaresEvent
  | AnalyseInitEvent
  | AnalyseDoneEvent
  | AnalyseErrorEvent;

export const rnaAnalysisMachine = createMachine<AnalysisContext, AnalysisEvent>(
  {
    id: "rna_analysis",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: { actions: "assignWorkNumber" },
          UPDATE_LABWARES: { actions: "assignLabwares" },
          ANALYSE_INITIALIZE: { target: "analysing", cond: "LabwaresNotEmpty" },
        },
      },
      analysing: {},
    },
  },
  {
    actions: {
      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") return;
        ctx.workNumber = e.workNumber;
      }),
      assignLabwares: assign((ctx, e) => {
        if (e.type !== "UPDATE_LABWARES") return;
        ctx.labwares = e.labwares;
      }),
    },

    guards: {
      labwaresNotEmpty: (ctx, e) => ctx.labwares.length > 0,
    },
    services: {
      /*analyse: (ctx,e) => {
      }*/
    },
  }
);
