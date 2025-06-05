import { ClientError } from 'graphql-request';
import { GetLabwareOperationsQuery, OperationFieldsFragment, SetOpWorkRequestMutation } from '../../types/sdk';
import { assign, createMachine, fromPromise } from 'xstate';
import { stanCore } from '../../lib/sdk';
import { Draft } from 'immer';
import { castDraft } from '../../dependencies/immer';

export interface ReviseWorkNumberMachineContext {
  submissionResult?: string;
  serverError?: ClientError;
  operations: Array<OperationFieldsFragment>;
  barcode: string;
  eventType: string;
  opIds: Array<number>;
  workNumber: string;
  selectedOps: Array<number>;
}

type SetEventType = {
  type: 'SET_EVENT_TYPE';
  eventType: string;
};

type SetBarcode = {
  type: 'SET_BARCODE';
  barcode: string;
};

type SetWorkNumber = {
  type: 'SET_WORK_NUMBER';
  workNumber: string;
};
type FindOperationEvent = {
  type: 'FIND_OPERATIONS';
};

type FindOperationSuccessEvent = {
  type: 'xstate.done.actor.findOperations';
  output: GetLabwareOperationsQuery;
};
type FindOperationErrorEvent = {
  type: 'xstate.error.actor.findOperations';
  error: Draft<ClientError>;
};

type ToggleOperationSelectionEvent = {
  type: 'TOGGLE_OPERATION';
  opId: number;
};

type SubmitEvent = {
  type: 'SUBMIT';
};

type ReviseWorkNumberEvent = {
  type: 'xstate.done.actor.reviseWorkNumber';
  output: SetOpWorkRequestMutation;
};

type ReviseWorkNumberErrorEvent = {
  type: 'xstate.error.actor.reviseWorkNumber';
  error: Draft<ClientError>;
};
type ReviseWorkNumberMachineEvents =
  | SetEventType
  | SetBarcode
  | SetWorkNumber
  | FindOperationEvent
  | FindOperationSuccessEvent
  | FindOperationErrorEvent
  | SubmitEvent
  | ToggleOperationSelectionEvent
  | ReviseWorkNumberEvent
  | ReviseWorkNumberErrorEvent;

export const reviseWorkNumberMachine = createMachine(
  {
    id: 'reviseWorkNumberMachine',
    initial: 'ready',
    types: {} as {
      context: ReviseWorkNumberMachineContext;
      events: ReviseWorkNumberMachineEvents;
    },
    context: ({ input }: { input: ReviseWorkNumberMachineContext }): ReviseWorkNumberMachineContext => ({
      ...input
    }),
    states: {
      ready: {
        on: {
          SET_EVENT_TYPE: {
            actions: 'assignEventType'
          },
          SET_BARCODE: {
            actions: 'assignBarcode'
          },
          SET_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          TOGGLE_OPERATION: {
            actions: 'toggleOperationSelect'
          },
          FIND_OPERATIONS: {
            target: 'find_operations'
          },
          SUBMIT: {
            target: 'submitting'
          }
        }
      },
      find_operations: {
        invoke: {
          id: 'findOperations',
          src: fromPromise(async ({ input }) => {
            return await stanCore.GetLabwareOperations({
              ...input
            });
          }),
          input: ({ context, event }) => {
            if (event.type !== 'FIND_OPERATIONS') return undefined;
            return {
              barcode: context.barcode,
              operationType: context.eventType
            };
          },
          onDone: {
            target: 'selecting_operations',
            actions: 'assignOperations'
          },
          onError: {
            target: 'ready',
            actions: 'assignServerError'
          }
        }
      },
      selecting_operations: {
        on: {
          TOGGLE_OPERATION: {
            actions: 'toggleOperationSelect'
          },
          SET_EVENT_TYPE: {
            actions: 'assignEventType'
          },
          SET_BARCODE: {
            actions: 'assignBarcode'
          },
          SET_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          FIND_OPERATIONS: {
            target: 'find_operations'
          },
          SUBMIT: {
            target: 'submitting'
          }
        }
      },
      submitting: {
        invoke: {
          id: 'reviseWorkNumber',
          src: fromPromise(async ({ input }) => {
            return await stanCore.SetOpWorkRequest({
              request: {
                ...input
              }
            });
          }),
          input: ({ context }) => {
            return {
              workNumber: context.workNumber,
              opIds: context.selectedOps
            };
          },
          onDone: {
            target: 'final',
            actions: 'assignSubmissionResult'
          },
          onError: {
            target: 'ready',
            actions: 'assignServerError'
          }
        }
      },
      final: {}
    }
  },
  {
    actions: {
      assignEventType: assign(({ context, event }) => {
        if (event.type !== 'SET_EVENT_TYPE') return context;
        return {
          ...context,
          eventType: event.eventType,
          serverError: undefined
        };
      }),
      assignBarcode: assign(({ context, event }) => {
        if (event.type !== 'SET_BARCODE') return context;
        return {
          ...context,
          barcode: event.barcode,
          serverError: undefined
        };
      }),
      assignWorkNumber: assign(({ context, event }) => {
        if (event.type !== 'SET_WORK_NUMBER') return context;
        return {
          ...context,
          workNumber: event.workNumber,
          serverError: undefined
        };
      }),
      assignOperations: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.findOperations' || !event.output) return context;
        if (!event.output.labwareOperations || event.output.labwareOperations.length === 0)
          return {
            ...context,
            operations: [],
            serverError: undefined
          };
        return {
          ...context,
          operations: event.output.labwareOperations.filter((operation) => operation !== null),
          selectedOps: [],
          serverError: undefined
        };
      }),
      toggleOperationSelect: assign(({ context, event }) => {
        if (event.type !== 'TOGGLE_OPERATION') return context;
        const isSelected = context.selectedOps.some((opId) => event.opId === opId);
        if (isSelected) {
          return {
            ...context,
            selectedOps: context.selectedOps.filter((opId) => event.opId !== opId),
            serverError: undefined
          };
        } else {
          return {
            ...context,
            selectedOps: [...context.selectedOps, event.opId],
            serverError: undefined
          };
        }
      }),
      assignServerError: assign(({ context, event }) => {
        if (event.type !== 'xstate.error.actor.findOperations' && event.type !== 'xstate.error.actor.reviseWorkNumber')
          return context;
        return {
          ...context,
          serverError: castDraft(event.error)
        };
      }),
      assignSubmissionResult: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.reviseWorkNumber') return context;
        const successfullyUpdatedOpIds = event.output.setOperationWork.map((op) => op.id);
        if (successfullyUpdatedOpIds.length !== context.selectedOps.length) {
          return {
            ...context,
            submissionResult: `Some operations were not updated. Successfully revised operations to work number ${
              context.workNumber
            } are: ${successfullyUpdatedOpIds.join(', ')}`,
            serverError: undefined
          };
        } else {
          return {
            ...context,
            submissionResult: `All selected operations have been successfully revised to the work number ${context.workNumber}.`,
            serverError: undefined
          };
        }
      })
    }
  }
);
