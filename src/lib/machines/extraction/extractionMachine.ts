import { assign, createMachine, fromCallback, fromPromise } from 'xstate';
import { castDraft } from '../../../dependencies/immer';
import { ExtractMutation, ExtractRequest, LabwareFieldsFragment } from '../../../types/sdk';
import { stanCore } from '../../sdk';
import { ServerErrors } from '../../../types/stan';

export interface ExtractionContext {
  workNumber: string;
  labwares: LabwareFieldsFragment[];
  equipmentId: number;
  extraction?: ExtractMutation;
  serverErrors?: ServerErrors;
}

type UpdateLabwaresEvent = {
  type: 'UPDATE_LABWARES';
  labwares: LabwareFieldsFragment[];
};
type ExtractEvent = { type: 'EXTRACT' };
type ExtractDoneEvent = {
  type: 'xstate.done.actor.extract';
  output: ExtractMutation;
};
type ExtractErrorEvent = {
  type: 'xstate.error.actor.extract';
  error: ServerErrors;
};

export type ExtractionEvent =
  | { type: 'UPDATE_WORK_NUMBER'; workNumber: string }
  | { type: 'UPDATE_EQUIPMENT_ID'; equipmentId: number }
  | { type: 'IS_VALID' }
  | { type: 'IS_INVALID' }
  | UpdateLabwaresEvent
  | ExtractEvent
  | ExtractDoneEvent
  | ExtractErrorEvent;

export const extractionMachine = createMachine(
  {
    id: 'extraction',
    types: {} as {
      context: ExtractionContext;
      events: ExtractionEvent;
    },
    context: {
      labwares: [],
      workNumber: '',
      equipmentId: 0
    },
    initial: 'ready',
    states: {
      ready: {
        initial: 'invalid',
        on: {
          UPDATE_WORK_NUMBER: {
            target: 'validating',
            actions: 'assignWorkNumber'
          },
          UPDATE_LABWARES: {
            actions: 'assignLabwares',
            target: 'validating'
          },
          UPDATE_EQUIPMENT_ID: {
            actions: 'assignEquipmentId',
            target: 'validating'
          }
        },
        states: {
          valid: {
            on: {
              EXTRACT: '#extraction.extracting'
            }
          },
          invalid: {}
        }
      },
      extracting: {
        invoke: {
          id: 'extract',
          src: fromPromise(({ input }: { input: ExtractRequest }) =>
            stanCore.Extract({
              request: {
                ...input,
                labwareType: 'Tube'
              }
            })
          ),
          input: ({ context }) => ({
            workNumber: context.workNumber,
            barcodes: context.labwares.map((lw) => lw.barcode),
            equipmentId: context.equipmentId > 0 ? context.equipmentId : undefined
          }),
          onDone: {
            target: 'extracted',
            actions: 'assignExtraction'
          },
          onError: {
            target: 'ready.valid',
            actions: 'assignServerErrors'
          }
        }
      },
      validating: {
        invoke: {
          id: 'validateExtraction',
          src: fromCallback(({ sendBack, receive, input }) => {
            const isValid = input.labwares.length > 0 && input.workNumber !== '' && input.equipmentId !== 0;
            sendBack({ type: isValid ? 'IS_VALID' : 'IS_INVALID' });
          }),
          input: ({ context }) => ({
            labwares: context.labwares,
            workNumber: context.workNumber,
            equipmentId: context.equipmentId
          })
        },
        on: {
          IS_VALID: 'ready.valid',
          IS_INVALID: 'ready.invalid'
        }
      },
      extracted: {}
    }
  },
  {
    actions: {
      assignLabwares: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_LABWARES') {
          return context;
        }
        context.labwares = event.labwares;
        return context;
      }),

      assignExtraction: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.extract') {
          return context;
        }
        context.extraction = event.output;
        return context;
      }),

      assignServerErrors: assign(({ context, event }) => {
        if (event.type !== 'xstate.error.actor.extract') {
          return context;
        }
        context.serverErrors = castDraft(event.error);
        return context;
      }),

      assignWorkNumber: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_WORK_NUMBER') return context;
        context.workNumber = event.workNumber;
        return context;
      }),

      assignEquipmentId: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_EQUIPMENT_ID') return context;
        context.equipmentId = event.equipmentId;
        return context;
      })
    }
  }
);

export default extractionMachine;
