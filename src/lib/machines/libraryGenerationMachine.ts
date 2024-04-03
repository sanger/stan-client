import { assign, createMachine, fromPromise } from 'xstate';
import {
  ReagentPlate,
  ReagentTransfer,
  RecordLibraryPrepMutation,
  SlotCopyDestination,
  SlotCopySource,
  SlotMeasurementRequest
} from '../../types/sdk';
import { stanCore } from '../sdk';
import { Source } from './slotCopy/slotCopyMachine';
import { extractServerErrors, NewFlaggedLabwareLayout, ServerErrors } from '../../types/stan';
import { produce } from '../../dependencies/immer';
import { ClientError } from 'graphql-request';

type UpdateWorkNumberEvent = {
  type: 'UPDATE_WORK_NUMBER';
  workNumber: string;
};

type RecordLibraryGenerationEvent = {
  type: 'SAVE';
  slotMeasurements?: Array<SlotMeasurementRequest>;
};

type GoToReagentTransferEvent = {
  type: 'GO_TO_REAGENT_TRANSFER';
  slotCopyDetails?: SlotCopyDestination;
  sources?: Source[];
  destination?: SlotCopyDestination;
  destinationLabware?: NewFlaggedLabwareLayout;
  slotMeasurements?: SlotMeasurementRequest[];
};

type GoToSampleTransferEvent = {
  type: 'GO_TO_SAMPLE_TRANSFER';
  reagentTransfers: Array<ReagentTransfer>;
  sourceReagentPlate?: ReagentPlate;
  reagentPlateType?: string;
};

type GoToAmplificationEvent = {
  type: 'GO_TO_AMPLIFICATION';
  reagentTransfers: Array<ReagentTransfer>;
  sourceReagentPlate?: ReagentPlate;
  reagentPlateType?: string;
};

type UpdateSlotMeasurementsEvent = {
  type: 'UPDATE_SLOT_MEASUREMENTS';
  slotMeasurements: Array<SlotMeasurementRequest>;
};

type UpdateSampleDestinationEvent = {
  type: 'UPDATE_SAMPLE_TRANSFER_DESTINATION';
  destination: SlotCopyDestination;
};

type UpdateReagentPlateTypeEvent = {
  type: 'UPDATE_REAGENT_PLATE_TYPE';
  plateType: string;
};

type ServerErrorEvent = {
  type: 'xstate.error.actor.submitLibraryPrep';
  error: ClientError;
};

type ServerSuccessEvent = {
  type: 'xstate.done.actor.submitLibraryPrep';
  output: RecordLibraryPrepMutation;
};

type RemoveTransferredReagentEvent = {
  type: 'REMOVE_TRANSFERRED_REAGENT';
  newSource: Array<Source>;
};

type ClearReagentTransferTypeEvent = {
  type: 'CLEAR_REAGENT_TRANSFER';
};

type LibraryPrepEvents =
  | UpdateWorkNumberEvent
  | UpdateSampleDestinationEvent
  | RecordLibraryGenerationEvent
  | GoToReagentTransferEvent
  | UpdateReagentPlateTypeEvent
  | UpdateSlotMeasurementsEvent
  | GoToSampleTransferEvent
  | GoToAmplificationEvent
  | RemoveTransferredReagentEvent
  | ClearReagentTransferTypeEvent
  | ServerSuccessEvent
  | ServerErrorEvent;

type LibraryPrepContext = {
  workNumber: string;
  /** The source labware and new labware states for this request. */
  sources: Array<SlotCopySource>;
  /** The one destination labware for this request, and the description of what is transferred into it. */
  destination?: SlotCopyDestination;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The type of reagent plate involved. */
  reagentPlateType?: string;
  /** The measurement to record on slots in the destination. */
  slotMeasurements?: Array<SlotMeasurementRequest>;
  /** used for the labware display at the reagent transfer step */
  destinationLabware?: NewFlaggedLabwareLayout;

  serverErrors?: ServerErrors;

  serverSuccess?: RecordLibraryPrepMutation;
};

export const libraryGenerationMachine = createMachine(
  {
    id: 'libraryGeneration',
    initial: 'sampleTransfer',
    types: {} as {
      context: LibraryPrepContext;
      events: LibraryPrepEvents;
    },
    context: ({ input }: { input: LibraryPrepContext }): LibraryPrepContext => ({ ...input }),
    states: {
      sampleTransfer: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: 'updateWorkNumber'
          },
          UPDATE_SAMPLE_TRANSFER_DESTINATION: {
            actions: 'assignSampleTransferDestination'
          },
          GO_TO_REAGENT_TRANSFER: {
            target: 'reagentTransfer',
            actions: ['assignDestinationLabware', 'assignTransferredSamples', 'assignSlotMeasurements']
          },
          REMOVE_TRANSFERRED_REAGENT: {
            actions: 'removeTransferredReagents'
          },
          CLEAR_REAGENT_TRANSFER: {
            actions: 'clearTransferredReagents'
          }
        }
      },
      reagentTransfer: {
        entry: 'emptyServerError',
        on: {
          UPDATE_WORK_NUMBER: {
            actions: 'updateWorkNumber'
          },
          UPDATE_REAGENT_PLATE_TYPE: {
            actions: 'assignReagentPlateType'
          },
          GO_TO_SAMPLE_TRANSFER: {
            actions: 'assignTransferredReagents',
            target: 'sampleTransfer'
          },
          GO_TO_AMPLIFICATION: {
            target: 'amplification',
            actions: 'assignTransferredReagents'
          }
        }
      },
      amplification: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: 'updateWorkNumber'
          },
          UPDATE_SLOT_MEASUREMENTS: {
            actions: 'assignSlotMeasurements'
          },
          GO_TO_REAGENT_TRANSFER: {
            target: 'reagentTransfer',
            actions: ['assignSlotMeasurements']
          },
          SAVE: {
            actions: 'assignSlotMeasurements',
            target: 'recording'
          }
        }
      },
      recording: {
        invoke: {
          id: 'submitLibraryPrep',
          input: ({ context }) => ({
            workNumber: context.workNumber,
            sources: context.sources,
            destination: context.destination,
            slotMeasurements: context.slotMeasurements,
            reagentPlateType: context.reagentPlateType,
            reagentTransfers: context.reagentTransfers
          }),
          src: fromPromise(({ input }) => {
            return stanCore.RecordLibraryPrep({
              request: { ...input }
            });
          }),
          onDone: {
            actions: 'assignServerSuccess',
            target: 'recorded'
          },
          onError: {
            actions: 'assignServerError',
            target: 'amplification'
          }
        }
      },
      recorded: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      updateWorkNumber: assign(({ context, event }) => {
        if (event.type === 'UPDATE_WORK_NUMBER') {
          return { ...context, workNumber: event.workNumber };
        }
        return context;
      }),
      assignReagentPlateType: assign(({ context, event }) => {
        if (event.type === 'UPDATE_REAGENT_PLATE_TYPE') {
          return { ...context, reagentPlateType: event.plateType };
        }
        return context;
      }),

      assignDestinationLabware: assign(({ context, event }) => {
        if (event.type === 'GO_TO_REAGENT_TRANSFER' && event.destinationLabware) {
          return {
            ...context,
            destinationLabware: event.destinationLabware
          };
        }
        return context;
      }),
      assignTransferredSamples: assign(({ context, event }) => {
        if (event.type === 'GO_TO_REAGENT_TRANSFER' && event.slotCopyDetails && event.sources) {
          const sources = event.sources.reduce((arr: SlotCopySource[], curr: Source) => {
            if (curr.labwareState) {
              arr.push({ barcode: curr.labware.barcode, labwareState: curr.labwareState });
            }
            return arr;
          }, []);

          let updatedDestinationLabware = context.destinationLabware;
          /* assign transferred sample to  destination plate */
          const sourcesLabware = event.sources.map((source) => source.labware);
          event.slotCopyDetails.contents.forEach((content) => {
            const samples = sourcesLabware
              .find((labware) => labware.barcode === content.sourceBarcode)
              ?.slots.find((slot) => slot.address === content.sourceAddress)?.samples;

            if (samples) {
              updatedDestinationLabware = produce(updatedDestinationLabware, (draft) => {
                const destinationSlot = draft!.slots.find((slot) => slot.address === content.destinationAddress);
                if (destinationSlot) {
                  destinationSlot.samples = samples;
                }
              });
            }
          });
          return {
            ...context,
            destination: event.slotCopyDetails,
            sources,
            destinationLabware: updatedDestinationLabware
          };
        }
        return context;
      }),
      assignSlotMeasurements: assign(({ context, event }) => {
        if ((event.type === 'GO_TO_REAGENT_TRANSFER' || event.type === 'SAVE') && event.slotMeasurements) {
          return { ...context, slotMeasurements: event.slotMeasurements };
        }
        return context;
      }),
      assignTransferredReagents: assign(({ context, event }) => {
        if (
          (event.type === 'GO_TO_SAMPLE_TRANSFER' || event.type === 'GO_TO_AMPLIFICATION') &&
          event.reagentTransfers
        ) {
          return {
            ...context,
            reagentTransfers: event.reagentTransfers,
            sourceReagentPlate: event.sourceReagentPlate,
            reagentPlateType: event.reagentPlateType
          };
        }
        return context;
      }),
      assignReadyToRecord: assign(({ context }) => {
        return { ...context, readyToRecord: true };
      }),
      assignServerError: assign(({ context, event }) => {
        if (event.type === 'xstate.error.actor.submitLibraryPrep') {
          return {
            ...context,
            serverErrors: extractServerErrors(event.error)
          };
        }
        return context;
      }),
      removeTransferredReagents: assign(({ context, event }) => {
        if (event.type === 'REMOVE_TRANSFERRED_REAGENT') {
          const sourceBarcodes = event.newSource.map((source) => source.labware.barcode);
          const updatedDestination = context.destination?.contents.filter((content) =>
            sourceBarcodes.includes(content.sourceBarcode)
          );
          const updatedDestinationAddress = updatedDestination?.map((content) => content.destinationAddress);
          const updatedTransferredReagents = context.reagentTransfers.filter(
            (rg) => updatedDestinationAddress?.includes(rg.destinationAddress)
          );
          const updatedDestinationLabware = produce(context.destinationLabware, (draft) => {
            const destinationSlot = draft!.slots.find((slot) => !updatedDestinationAddress?.includes(slot.address));
            if (destinationSlot) {
              destinationSlot.samples = [];
            }
          });
          return {
            ...context,
            slotMeasurements: undefined,
            reagentTransfers: updatedTransferredReagents,
            destination: { ...context.destination, contents: updatedDestination ?? [] },
            destinationLabware: updatedDestinationLabware,
            sources: event.newSource.reduce((arr: SlotCopySource[], curr: Source) => {
              if (curr.labwareState) {
                arr.push({ barcode: curr.labware.barcode, labwareState: curr.labwareState });
              }
              return arr;
            }, [])
          };
        }
        return context;
      }),
      clearTransferredReagents: assign(({ context, event }) => {
        if (event.type === 'CLEAR_REAGENT_TRANSFER') {
          return {
            ...context,
            reagentTransfers: [],
            sourceReagentPlate: undefined,
            reagentPlateType: undefined
          };
        }
        return context;
      }),
      emptyServerError: assign(({ context }) => {
        return { ...context, serverErrors: undefined };
      }),
      assignServerSuccess: assign(({ context, event }) => {
        if (event.type === 'xstate.done.actor.submitLibraryPrep') {
          return { ...context, serverSuccess: event.output };
        }
        return context;
      })
    }
  }
);
