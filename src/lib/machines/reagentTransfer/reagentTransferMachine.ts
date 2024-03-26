import { assign, createMachine, fromPromise } from 'xstate';
import { castDraft } from '../../../dependencies/immer';

import { ClientError } from 'graphql-request';
import {
  FindReagentPlateQuery,
  LabwareFlaggedFieldsFragment,
  Maybe,
  ReagentPlate,
  ReagentTransfer,
  RecordReagentTransferMutation
} from '../../../types/sdk';
import { OperationTypeName } from '../../../types/stan';
import { stanCore } from '../../sdk';

/**
 * Context for SlotCopy Machine
 */
export interface ReagentTransferContext {
  /**
   * The work number associated with this operation
   */
  workNumber: string;
  /**
   * The operation type associated with reagent transfer
   */
  operationType: OperationTypeName;

  /**Source barcode**/
  sourceBarcode?: string;

  /**
   * Dual Index plate, which is the source labware, from which the reagent is copied.
   * This is fetched and if doesn't exist it will be created
   */
  sourceReagentPlate: ReagentPlate | undefined;

  /**The type of reagent plate involved.**/
  plateType: string;

  /**
   * 96 well plate, which is the destination labware, to which the reagent is copied
   */
  destLabware: LabwareFlaggedFieldsFragment | undefined;

  /**
   * All the transfers to record between slots in source and destination
   */
  reagentTransfers: Array<ReagentTransfer>;

  /**The result returned by reagentTransfer api*/
  reagentTransferResult?: RecordReagentTransferMutation;

  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;

  validationError?: string;
}

type UpdateTransferContent = {
  type: 'UPDATE_TRANSFER_CONTENT';
  reagentTransfers: Array<ReagentTransfer>;
};

type UpdateWorkNumber = {
  type: 'UPDATE_WORK_NUMBER';
  workNumber: string;
};

type SetSourceLabware = {
  type: 'SET_SOURCE_LABWARE';
  barcode: string;
};

type SetDestinationLabware = {
  type: 'SET_DESTINATION_LABWARE';
  labware: LabwareFlaggedFieldsFragment;
};

type SetPlateType = {
  type: 'SET_PLATE_TYPE';
  plateType: string;
};

type SaveEvent = { type: 'SAVE' };

type FindReagentPlateEventDone = {
  type: 'xstate.done.actor.findReagentPlate';
  output: FindReagentPlateQuery;
};

type FindReagentPlateEventError = {
  type: 'xstate.error.actor.findReagentPlate';
  error: Maybe<ClientError>;
};

type SaveReagentTransferEventDone = {
  type: 'xstate.done.actor.reagentTransfer';
  output: RecordReagentTransferMutation;
};

type SaveReagentTransferEvenError = {
  type: 'xstate.done.actor.reagentTransfer';
  error: Maybe<ClientError>;
};

export type ReagentTransferEvent =
  | UpdateWorkNumber
  | SetSourceLabware
  | SetDestinationLabware
  | SetPlateType
  | UpdateTransferContent
  | SaveEvent
  | FindReagentPlateEventDone
  | FindReagentPlateEventError
  | SaveReagentTransferEventDone
  | SaveReagentTransferEvenError;

/**
 * Reagent Transfer Machine Config
 */
export const reagentTransferMachine = createMachine(
  {
    types: {} as {
      context: ReagentTransferContext;
      event: ReagentTransferEvent;
    },
    id: 'slotCopy',
    initial: 'ready',
    context: {
      operationType: 'Dual index plate',
      sourceReagentPlate: undefined,
      destLabware: undefined,
      workNumber: '',
      reagentTransfers: [],
      reagentTransferResult: undefined,
      plateType: ''
    },
    // context: ({
    //   input
    // }: {
    //   input: { destLabware: LabwareFlaggedFieldsFragment | undefined };
    // }): ReagentTransferContext => ({
    //   operationType: 'Dual index plate',
    //   sourceReagentPlate: undefined,
    //   destLabware: input.destLabware,
    //   workNumber: '',
    //   reagentTransfers: [],
    //   reagentTransferResult: undefined,
    //   plateType: ''
    // }),
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          SET_SOURCE_LABWARE: [
            {
              target: 'finding',
              guard: ({ event }) => /^[0-9]{24}$/.test(event.barcode),
              actions: ['emptyValidationError', 'assignSourceBarcode']
            },
            {
              actions: 'assignValidationError'
            }
          ],
          SET_PLATE_TYPE: {
            actions: 'assignPlateType'
          },
          SET_DESTINATION_LABWARE: {
            actions: 'assignDestination'
          },
          UPDATE_TRANSFER_CONTENT: [
            {
              target: 'readyToCopy',
              guard: ({ event, context }) =>
                context.sourceReagentPlate !== undefined && context.destLabware !== undefined,
              actions: 'assignTransfers'
            },
            {
              actions: 'assignTransfers'
            }
          ]
        }
      },
      finding: {
        invoke: {
          id: 'findReagentPlate',
          src: fromPromise(({ input }) => stanCore.FindReagentPlate({ barcode: input.barcode })),
          input: ({ event }) => ({ barcode: event.barcode }),
          onDone: {
            target: 'ready',
            actions: 'assignReagentPlate'
          },
          onError: {
            target: 'ready',
            actions: ['assignServerError']
          }
        }
      },
      readyToCopy: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          UPDATE_TRANSFER_CONTENT: {
            actions: ['assignTransfers']
          },
          SET_PLATE_TYPE: {
            actions: 'assignPlateType'
          },
          SAVE: 'transferring'
        }
      },
      transferring: {
        entry: 'emptyServerError',
        invoke: {
          id: 'reagentTransfer',
          src: fromPromise(({ input }) => {
            if (!input.sourceReagentPlate) {
              return Promise.reject();
            }
            return stanCore.RecordReagentTransfer({
              request: {
                workNumber: input.workNumber,
                operationType: input.operationType,
                destinationBarcode: input.destinationBarcode,
                transfers: input.transfers,
                plateType: input.plateType
              }
            });
          }),
          input: ({ context }) => {
            return {
              workNumber: context.workNumber,
              operationType: context.operationType,
              destinationBarcode: context.destLabware!.barcode,
              transfers: context.reagentTransfers,
              plateType: context.plateType,
              sourceReagentPlate: context.sourceReagentPlate
            };
          },
          onDone: {
            target: 'transferred',
            actions: 'assignResult'
          },
          onError: {
            target: 'readyToCopy',
            actions: 'assignServerError'
          }
        }
      },
      transferred: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      assignWorkNumber: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_WORK_NUMBER') return context;
        context.workNumber = event.workNumber;
        return context;
      }),
      assignSourceBarcode: assign(({ context, event }) => {
        if (event.type !== 'SET_SOURCE_LABWARE') return context;
        context.sourceBarcode = event.barcode;
        return context;
      }),
      assignDestination: assign(({ context, event }) => {
        if (event.type !== 'SET_DESTINATION_LABWARE') return context;
        return { ...context, destLabware: event.labware };
      }),
      assignPlateType: assign(({ context, event }) => {
        if (event.type !== 'SET_PLATE_TYPE') return context;
        context.plateType = event.plateType;
        return context;
      }),
      assignReagentPlate: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.findReagentPlate' || context.sourceBarcode === undefined) return context;
        context.sourceReagentPlate = event.output.reagentPlate
          ? {
              barcode: event.output.reagentPlate.barcode,
              slots: event.output.reagentPlate.slots ?? [],
              plateType: event.output.reagentPlate.plateType
            }
          : { barcode: context.sourceBarcode, slots: [] };
        if (event.output.reagentPlate && event.output.reagentPlate.plateType) {
          context.plateType = event.output.reagentPlate.plateType;
        }
        return context;
      }),
      assignTransfers: assign(({ context, event }) => {
        if (event.type === 'UPDATE_TRANSFER_CONTENT') return { ...context, reagentTransfers: event.reagentTransfers };
        return context;
      }),

      assignResult: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.reagentTransfer') {
          return context;
        }
        context.reagentTransferResult = event.output;
        return context;
      }),

      assignServerError: assign(({ context, event }) => {
        if (
          event.type !== 'xstate.error.actor.reagentTransfer' &&
          event.type !== 'xstate.error.actor.findReagentPlate'
        ) {
          return context;
        }
        context.serverErrors = castDraft(event.error);
        return context;
      }),

      emptyServerError: assign(({ context }) => {
        context.serverErrors = null;
        return context;
      }),
      assignValidationError: assign(({ context }) => {
        context.validationError = '24 digit number required';
        return context;
      }),
      emptyValidationError: assign(({ context }) => {
        context.validationError = undefined;
        return context;
      })
    }
  }
);

export default reagentTransferMachine;
