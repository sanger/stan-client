import { assign, createMachine, fromPromise, InternalMachineImplementations, MachineConfig } from 'xstate';
import { LabelPrinterContext, LabelPrinterEvent } from './labelPrinterMachineTypes';
import { find } from 'lodash';
import { castDraft, produce } from '../../../dependencies/immer';
import { stanCore } from '../../sdk';
import { LabelType, LabwareFieldsFragment, PrinterFieldsFragment } from '../../../types/sdk';

/**
 * LabelPrinter Machine Options
 */

type LabelPrinterMachineImplementation = {
  context: LabelPrinterContext;
  events: LabelPrinterEvent;
  actors: any;
  actions: any;
  guards: any;
  delays: any;
  tags: any;
  emitted: any;
};

const machineOptions: InternalMachineImplementations<LabelPrinterMachineImplementation> = {
  actions: {
    assignPrinters: assign(({ context, event }) => {
      if (event.type !== 'xstate.done.actor.fetchPrinters') {
        return context;
      }
      return produce(context, (draft) => {
        const labwareLabelTypes = new Set(
          draft.labwares.map((lw: LabwareFieldsFragment) => lw.labwareType?.labelType?.name)
        );

        // Only have available printers of the labwares' label type (if there is one)
        draft.printers = event.output.printers.filter((printer: PrinterFieldsFragment) =>
          printer.labelTypes.some((lt: LabelType) => labwareLabelTypes.has(lt.name))
        );
        draft.selectedPrinter = draft.printers[0];
      });
    }),

    assignServerErrors: assign(({ context, event }) => {
      if (event.type !== 'xstate.error.actor.fetchPrinters') {
        return context;
      }
      return { ...context, serverErrors: castDraft(event.error) };
    }),

    assignLabelPrinter: assign(({ context, event }) => {
      if (event.type === 'UPDATE_SELECTED_LABEL_PRINTER') {
        return {
          ...context,
          selectedPrinter: find(context.printers, (printer) => printer.name === event.name) ?? null
        };
      }
      return context;
    })
  },

  guards: {
    labelPrinterAssigned: ({ context }: { context: LabelPrinterContext }) => !!context.selectedPrinter
  }
};

/**
 * LabelPrinter Machine Config
 */
const machineConfig: MachineConfig<LabelPrinterContext, LabelPrinterEvent> = {
  id: 'labelPrinter',
  context: ({ input }): LabelPrinterContext => ({
    ...input
  }),
  initial: 'init',
  states: {
    init: {
      always: [
        // Go to ready if there's already a pre-selected label printer (used for LabelPrinterButton)
        { target: 'ready', guard: 'labelPrinterAssigned' },
        { target: 'fetching' }
      ]
    },
    fetching: {
      invoke: {
        src: fromPromise(() => stanCore.GetPrinters()),
        id: 'fetchPrinters',
        onDone: {
          target: 'ready',
          actions: 'assignPrinters'
        },
        onError: {
          target: 'error',
          actions: 'assignServerErrors'
        }
      }
    },
    error: {},
    ready: {
      initial: 'idle',
      states: {
        idle: {},
        printSuccess: {},
        printError: {}
      },
      on: {
        UPDATE_SELECTED_LABEL_PRINTER: {
          actions: ['assignLabelPrinter'],
          target: '.idle'
        },
        PRINT: {
          target: 'printing'
        }
      }
    },
    printing: {
      invoke: {
        id: 'printLabels',
        src: fromPromise(({ input }) => {
          if (!input) {
            return Promise.reject('No selected printer');
          }
          return stanCore.Print({
            printer: input.printerName,
            barcodes: input.barcodes
          });
        }),
        input: ({ context, event }) => {
          if (!context.selectedPrinter) {
            return undefined;
          }
          let labelsPerBarcode = 1;
          if (event.type === 'PRINT' && event.labelsPerBarcode) {
            labelsPerBarcode = event.labelsPerBarcode;
          }
          return {
            printerName: context.selectedPrinter.name,
            barcodes: context.labwares.map((lw) => new Array(labelsPerBarcode).fill(lw.barcode)).flat()
          };
        },

        onDone: {
          target: 'ready.printSuccess'
        },
        onError: {
          target: 'ready.printError',
          actions: ['assignServerErrors']
        }
      }
    }
  }
};
const createLabelPrinterMachine = () =>
  createMachine(
    { ...machineConfig },
    {
      ...machineOptions
    }
  );
export default createLabelPrinterMachine;
