import { RnaAnalysisLabware } from "../../types/sdk";
import { AnalysisMeasurementType, DV200ValueTypes } from "./analysisLabware";
import { createMachine } from "xstate";

export type AnalysisLabwareContext = {
  analysisLabwares: RnaAnalysisLabware[];
  analysisType: string;
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

type InitializeMeasurementRangeTypeEvent = {
  type: "INIT_MEASUREMENT_TYPE";
  value: string;
};

type AnalysisLabwareEvent =
  | UpdateAnalysisTypeEvent
  | UpdateLabwareDataEvent
  | InitializeMeasurementRangeTypeEvent;

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
          INIT_MEASUREMENT_TYPE: {
            target: "ready",
            actions: "assignMeasurementRangeType",
          },
        },
      },
    },
  },
  {
    actions: {
      assignAnalysisType: (ctx, e) => {
        debugger;
        if (e.type !== "UPDATE_ANALYSIS_TYPE") return;
        ctx.analysisType = e.value;

        //Change analysis type in all labwares
        ctx.analysisLabwares = ctx.analysisLabwares.map((labware) => {
          return {
            ...labware,
            measurements: [
              {
                name: e.value,
                value: "",
              },
            ],
          };
        });
      },
      assignMeasurementRangeType: (ctx, e) => {
        if (e.type !== "INIT_MEASUREMENT_TYPE") return;
        debugger;
        //Change analysis type in all labwares to DV200_LOWER and DV200_UPPER
        const measurements =
          e.value === DV200ValueTypes.SINGLE_VALUE_TYPE
            ? [
                {
                  name: AnalysisMeasurementType.DV200,
                  value: "",
                },
              ]
            : [
                {
                  name: AnalysisMeasurementType.DV200_LOWER,
                  value: "",
                },
                {
                  name: AnalysisMeasurementType.DV200_UPPER,
                  value: "",
                },
              ];
        ctx.analysisLabwares = ctx.analysisLabwares.map((labware) => {
          return {
            ...labware,
            measurements: measurements,
          };
        });
      },
      assignLabwareData: (ctx, e) => {
        if (e.type !== "UPDATE_LABWARE_DATA") return;
        debugger;
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
              e.labware.measurementType == AnalysisMeasurementType.DV200
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
    },
  }
);
