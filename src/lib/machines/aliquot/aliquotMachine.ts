import { AliquotMutation, LabwareFieldsFragment } from '../../../types/sdk';
import { assign, createMachine, fromPromise } from 'xstate';
import { castDraft } from 'immer';
import { stanCore } from '../../sdk';
import { ServerErrors } from '../../../types/stan';

export interface AliquotContext {
  /**The work number to associate with this aliquot operation**/
  workNumber: string;

  /**The barcode of the source labware.**/
  labware: LabwareFieldsFragment | undefined;

  /**The number of destination labware to create.**/
  numLabware: number;

  /**The result returned by aliquot api*/
  aliquotResult?: AliquotMutation;

  /**Error returned from server**/
  serverErrors?: ServerErrors;
}
const aliquotLabwareType: string = 'Tube';
const aliquotOperationType: string = 'Aliquot';

type UpdateLabwareEvent = {
  type: 'UPDATE_LABWARE';
  labware: LabwareFieldsFragment;
};
type UpdateNumLabwareEvent = {
  type: 'UPDATE_NUM_LABWARE';
  numLabware: number;
};

type AliquotEvent = {
  type: 'ALIQUOT';
};
type AliquotDoneEvent = {
  type: 'xstate.done.actor.aliquot';
  output: AliquotMutation;
};
type AliquotErrorEvent = {
  type: 'xstate.error.actor.aliquot';
  error: ServerErrors;
};

export type AliquottingEvent =
  | { type: 'UPDATE_WORK_NUMBER'; workNumber: string }
  | AliquotEvent
  | AliquotDoneEvent
  | AliquotErrorEvent
  | UpdateLabwareEvent
  | UpdateNumLabwareEvent;

export const aliquotMachine = createMachine(
  {
    id: 'aliquot',
    types: {} as {
      context: AliquotContext;
      events: AliquottingEvent;
    },
    context: ({ input }: { input: AliquotContext }): AliquotContext => ({
      ...input
    }),
    initial: 'ready',
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: { actions: 'assignWorkNumber' },
          UPDATE_LABWARE: { actions: 'assignLabware' },
          UPDATE_NUM_LABWARE: { actions: 'assignNumLabware' },
          ALIQUOT: { target: 'aliquoting', guard: 'validAliquotInput' }
        }
      },
      aliquoting: {
        id: 'aliquot',
        invoke: {
          src: fromPromise(({ input }) => {
            if (input.labware) {
              return stanCore.Aliquot({
                request: {
                  workNumber: input.workNumber,
                  labwareType: aliquotLabwareType,
                  barcode: input.labware.barcode,
                  numLabware: input.numLabware,
                  operationType: aliquotOperationType
                }
              });
            } else {
              return Promise.reject();
            }
          }),
          input: ({ context, event }) => ({
            workNumber: context.workNumber,
            barcode: context.labware?.barcode,
            numLabware: context.numLabware,
            labware: context.labware
          }),
          onDone: {
            target: 'aliquotingDone',
            actions: 'assignAliquotResult'
          },
          onError: {
            target: 'aliquotFailed',
            actions: 'assignServerErrors'
          }
        }
      },
      aliquotFailed: {
        on: {
          ALIQUOT: { target: 'aliquoting', guard: 'validAliquotInput' },
          UPDATE_WORK_NUMBER: { actions: 'assignWorkNumber' },
          UPDATE_LABWARE: { actions: 'assignLabware' },
          UPDATE_NUM_LABWARE: { actions: 'assignNumLabware' }
        }
      },
      aliquotingDone: {}
    }
  },
  {
    actions: {
      assignLabware: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_LABWARE') {
          return context;
        }
        context.labware = event.labware;
        context.serverErrors = undefined;
        return context;
      }),
      assignNumLabware: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_NUM_LABWARE') {
          return context;
        }
        context.numLabware = event.numLabware;
        return context;
      }),
      assignWorkNumber: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_WORK_NUMBER') {
          return context;
        }
        context.workNumber = event.workNumber;
        return context;
      }),
      assignAliquotResult: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.aliquot') {
          return context;
        }
        context.aliquotResult = event.output;
        return context;
      }),
      assignServerErrors: assign(({ context, event }) => {
        if (event.type !== 'xstate.error.actor.aliquot') return context;
        context.serverErrors = castDraft(event.error);
        return context;
      })
    },
    guards: {
      validAliquotInput: ({ context }) =>
        context.labware !== undefined && context.labware.barcode.length > 0 && context.numLabware > 0
    }
  }
);

export default aliquotMachine;
