import { RnaAnalysisLabware, StringMeasurement } from "../../types/sdk";
import { createMachine } from "xstate";
import {
  AnalysisMeasurementType,
  MeasurementValueCategory,
} from "./measurementColumn";

export type AnalysisLabwareContext = {
  analysisLabwares: RnaAnalysisLabware[];
  operationType: string;
};

type UpdateAnalysisTypeEvent = {
  type: "UPDATE_ANALYSIS_TYPE";
  value: string;
};

type UpdateLabwareDataEvent = {
  type: "UPDATE_LABWARE_DATA";
  labware: {
    barcode: string;
    value: string;
    field: string;
    measurementType?: string;
  };
};
type UpdateMeasurementTypeEvent = {
  type: "UPDATE_MEASUREMENT_TYPE";
  barcode: string;
  value: string;
};
type UpdateAllCommentTypeEvent = {
  type: "UPDATE_ALL_COMMENTS_TYPE";
  commentId: string;
};

type AnalysisLabwareEvent =
  | UpdateAnalysisTypeEvent
  | UpdateLabwareDataEvent
  | UpdateMeasurementTypeEvent
  | UpdateAllCommentTypeEvent;

export const analysisLabwareMachine = createMachine<
  AnalysisLabwareContext,
  AnalysisLabwareEvent
>(
  {
    id: "record_analysis",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_ANALYSIS_TYPE: {
            target: "ready",
            actions: "assignAnalysisType",
          },
          UPDATE_LABWARE_DATA: {
            target: "ready",
            actions: "assignLabwareData",
          },
          UPDATE_MEASUREMENT_TYPE: {
            target: "ready",
            actions: "assignMeasurementType",
          },
          UPDATE_ALL_COMMENTS_TYPE: {
            target: "ready",
            actions: "assignComments",
          },
        },
      },
    },
  },
  {
    actions: {
      assignAnalysisType: (ctx, e) => {
        if (e.type !== "UPDATE_ANALYSIS_TYPE") return;
        ctx.operationType = e.value;
        const measurements = buildMeasurementFields(
          MeasurementValueCategory.SINGLE_VALUE_TYPE
        );
        //Change measurement data in all labwares
        ctx.analysisLabwares = ctx.analysisLabwares.map((labware) => {
          return {
            ...labware,
            measurements: measurements,
          };
        });
      },
      assignMeasurementType: (ctx, e) => {
        if (e.type !== "UPDATE_MEASUREMENT_TYPE") return;
        const indx = ctx.analysisLabwares.findIndex(
          (labware) => labware.barcode === e.barcode
        );
        if (indx < 0) return;

        const updateAnalysisLabware = {
          ...ctx.analysisLabwares[indx],
          measurements: buildMeasurementFields(e.value),
        };
        ctx.analysisLabwares = [
          ...ctx.analysisLabwares.slice(0, indx),
          updateAnalysisLabware,
          ...ctx.analysisLabwares.slice(indx + 1),
        ];
      },
      assignLabwareData: (ctx, e) => {
        if (e.type !== "UPDATE_LABWARE_DATA") return;
        const indx = ctx.analysisLabwares.findIndex(
          (labware) => labware.barcode === e.labware.barcode
        );
        if (indx < 0) return;
        const updateAnalysisLabware = { ...ctx.analysisLabwares[indx] };
        switch (e.labware.field) {
          case "workNumber": {
            updateAnalysisLabware.workNumber = e.labware.value as string;
            break;
          }
          case "measurements": {
            if (!e.labware.measurementType) return;
            const measurement = {
              name: e.labware.measurementType,
              value: e.labware.value,
            };
            if (
              e.labware.measurementType === AnalysisMeasurementType.RIN ||
              e.labware.measurementType === AnalysisMeasurementType.DV200
            )
              updateAnalysisLabware.measurements = [measurement];
            else {
              updateAnalysisLabware.measurements = updateAnalysisLabware.measurements.map(
                (measurement) => {
                  if (measurement.name === e.labware.measurementType) {
                    return {
                      ...measurement,
                      value: e.labware.value,
                    };
                  } else return measurement;
                }
              );
            }
            break;
          }
          case "comment": {
            updateAnalysisLabware.commentId = Number(e.labware.value);
            break;
          }
        }
        ctx.analysisLabwares = [
          ...ctx.analysisLabwares.slice(0, indx),
          updateAnalysisLabware,
          ...ctx.analysisLabwares.slice(indx + 1),
        ];
      },
      assignComments: (ctx, e) => {
        if (e.type !== "UPDATE_ALL_COMMENTS_TYPE") return;
        //Change measurement data in all labwares
        ctx.analysisLabwares = ctx.analysisLabwares.map((labware) => {
          return {
            ...labware,
            commentId: Number(e.commentId),
          };
        });
      },
    },
  }
);
const buildMeasurementFields = (valueCategory: string) => {
  let measurements: StringMeasurement[] = [];
  if (valueCategory === MeasurementValueCategory.SINGLE_VALUE_TYPE) {
    measurements = [
      {
        name: AnalysisMeasurementType.DV200,
        value: "",
      },
    ];
  } else if (valueCategory === MeasurementValueCategory.RANGE_VALUE_TYPE) {
    measurements = [
      {
        name: AnalysisMeasurementType.DV200_LOWER,
        value: "",
      },
      {
        name: AnalysisMeasurementType.DV200_UPPER,
        value: "",
      },
    ];
  }
  return measurements;
};
