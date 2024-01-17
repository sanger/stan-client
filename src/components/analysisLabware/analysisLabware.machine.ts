import { RnaAnalysisLabware, StringMeasurement } from '../../types/sdk';
import { createMachine } from 'xstate';
import { AnalysisMeasurementType, MeasurementValueCategory } from './measurementColumn';
import { OperationType } from './analysisLabware';

export type AnalysisLabwareContext = {
  analysisLabwares: RnaAnalysisLabware[];
  operationType: string | undefined;
};

type UpdateAnalysisTypeEvent = {
  type: 'UPDATE_ANALYSIS_TYPE';
  value: string;
};

type UpdateLabwareDataEvent = {
  type: 'UPDATE_LABWARE_DATA';
  labware: {
    barcode: string;
    value: string;
    field: string;
    measurementType?: string;
  };
};
type UpdateMeasurementTypeEvent = {
  type: 'UPDATE_MEASUREMENT_TYPE';
  barcode: string;
  value: string;
};
type UpdateAllCommentTypeEvent = {
  type: 'UPDATE_ALL_COMMENTS_TYPE';
  commentId: string;
};
type UpdateAllWorkNumbersEvent = {
  type: 'UPDATE_ALL_WORKNUMBERS';
  workNumber: string;
};

type AnalysisLabwareEvent =
  | UpdateAnalysisTypeEvent
  | UpdateLabwareDataEvent
  | UpdateMeasurementTypeEvent
  | UpdateAllCommentTypeEvent
  | UpdateAllWorkNumbersEvent;

export const analysisLabwareMachine = createMachine(
  {
    id: 'record_analysis',
    types: {} as {
      context: AnalysisLabwareContext;
      events: AnalysisLabwareEvent;
    },
    context: ({ input }: { input: AnalysisLabwareContext }): AnalysisLabwareContext => ({
      ...input
    }),
    initial: 'ready',
    states: {
      ready: {
        on: {
          UPDATE_ANALYSIS_TYPE: {
            target: 'ready',
            actions: 'assignAnalysisType'
          },
          UPDATE_LABWARE_DATA: {
            target: 'ready',
            actions: 'assignLabwareData'
          },
          UPDATE_MEASUREMENT_TYPE: {
            target: 'ready',
            actions: 'assignMeasurementType'
          },
          UPDATE_ALL_COMMENTS_TYPE: {
            target: 'ready',
            actions: 'assignComments'
          },
          UPDATE_ALL_WORKNUMBERS: {
            target: 'ready',
            actions: 'assignWorkNumbers'
          }
        }
      }
    }
  },
  {
    actions: {
      assignAnalysisType: ({ context, event }) => {
        if (event.type !== 'UPDATE_ANALYSIS_TYPE') return;
        context.operationType = event.value === AnalysisMeasurementType.RIN ? OperationType.RIN : OperationType.DV200;
        const measurements = buildMeasurementFields(MeasurementValueCategory.SINGLE_VALUE_TYPE, context.operationType);
        //Change measurement data in all labwares
        context.analysisLabwares = context.analysisLabwares.map((labware) => {
          return {
            ...labware,
            measurements: measurements
          };
        });
      },
      assignMeasurementType: ({ context, event }) => {
        if (event.type !== 'UPDATE_MEASUREMENT_TYPE') return;
        const indx = context.analysisLabwares.findIndex((labware) => labware.barcode === event.barcode);
        if (indx < 0 || !context.operationType) return;

        const updateAnalysisLabware = {
          ...context.analysisLabwares[indx],
          measurements: buildMeasurementFields(event.value, context.operationType)
        };
        context.analysisLabwares = [
          ...context.analysisLabwares.slice(0, indx),
          updateAnalysisLabware,
          ...context.analysisLabwares.slice(indx + 1)
        ];
      },
      assignLabwareData: ({ context, event }) => {
        if (event.type !== 'UPDATE_LABWARE_DATA') return;
        const indx = context.analysisLabwares.findIndex((labware) => labware.barcode === event.labware.barcode);
        if (indx < 0) return;
        const updateAnalysisLabware = { ...context.analysisLabwares[indx] };
        switch (event.labware.field) {
          case 'workNumber': {
            updateAnalysisLabware.workNumber = event.labware.value;
            break;
          }
          case 'measurements': {
            if (!event.labware.measurementType) return;
            const measurement = {
              name: event.labware.measurementType,
              value: event.labware.value
            };
            if (
              event.labware.measurementType === AnalysisMeasurementType.RIN ||
              event.labware.measurementType === AnalysisMeasurementType.DV200
            )
              updateAnalysisLabware.measurements = [measurement];
            else {
              updateAnalysisLabware.measurements = updateAnalysisLabware.measurements.map((measurement) => {
                if (measurement.name === event.labware.measurementType) {
                  return {
                    ...measurement,
                    value: event.labware.value
                  };
                } else return measurement;
              });
            }
            break;
          }
          case 'comment': {
            updateAnalysisLabware.commentId = event.labware.value !== '' ? Number(event.labware.value) : undefined;
            break;
          }
        }
        context.analysisLabwares = [
          ...context.analysisLabwares.slice(0, indx),
          updateAnalysisLabware,
          ...context.analysisLabwares.slice(indx + 1)
        ];
      },
      assignComments: ({ context, event }) => {
        if (event.type !== 'UPDATE_ALL_COMMENTS_TYPE') return;
        //Change measurement data in all labwares
        context.analysisLabwares = context.analysisLabwares.map((labware) => {
          return {
            ...labware,
            commentId: event.commentId !== '' ? Number(event.commentId) : undefined
          };
        });
      },
      assignWorkNumbers: ({ context, event }) => {
        if (event.type !== 'UPDATE_ALL_WORKNUMBERS') return;
        //Change measurement data in all labwares
        context.analysisLabwares = context.analysisLabwares.map((labware) => {
          return {
            ...labware,
            workNumber: event.workNumber
          };
        });
      }
    }
  }
);
const buildMeasurementFields = (valueCategory: string, operationType: string) => {
  let measurements: StringMeasurement[] = [];
  if (valueCategory === MeasurementValueCategory.SINGLE_VALUE_TYPE) {
    measurements = [
      {
        name: operationType === OperationType.RIN ? AnalysisMeasurementType.RIN : AnalysisMeasurementType.DV200,
        value: ''
      }
    ];
  } else if (valueCategory === MeasurementValueCategory.RANGE_VALUE_TYPE) {
    measurements = [
      {
        name: AnalysisMeasurementType.DV200_LOWER,
        value: ''
      },
      {
        name: AnalysisMeasurementType.DV200_UPPER,
        value: ''
      }
    ];
  }
  return measurements;
};
