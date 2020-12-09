import { Actor, Machine } from "xstate";
import {
  LabelPrinter,
  LabelPrinterContext,
  LabelPrinterOptions,
} from "./labelPrinterContext";
import { LabelPrinterSchema, State } from "./labelPrinterStates";
import { LabelPrinterEvents } from "./labelPrinterEvents";
import {
  Actions,
  Guards,
  labelPrinterMachineOptions,
  Services,
} from "./labelPrinterMachineOptions";

/**
 * LabelPrinter State Machine
 */
export const createLabelPrinterMachine = (
  labelPrinter: Partial<LabelPrinter>,
  options?: Partial<LabelPrinterOptions>
) =>
  Machine<LabelPrinterContext, LabelPrinterSchema, LabelPrinterEvents>(
    {
      id: "labelPrinter",
      context: {
        labelPrinter: Object.assign(
          {
            printers: [],
            selectedPrinter: null,
            labwareBarcodes: [],
          },
          labelPrinter
        ),
        options: Object.assign(
          { fetchPrinters: true, subscribers: new Set() },
          options
        ),
      },
      initial: State.INITIALISING,
      states: {
        [State.INITIALISING]: {
          always: [
            {
              cond: Guards.SHOULD_FETCH_PRINTERS,
              target: State.FETCHING,
            },
            { target: State.READY },
          ],
        },
        [State.FETCHING]: {
          invoke: {
            id: "fetchPrinters",
            src: Services.FETCH_PRINTERS,
            onDone: {
              target: State.READY,
              actions: [
                Actions.ASSIGN_LABEL_PRINTER,
                Actions.NOTIFY_SUBSCRIBERS,
              ],
            },
            onError: {
              target: State.FETCH_ERROR,
            },
          },
        },
        [State.FETCH_ERROR]: {
          on: {
            INIT: State.INITIALISING,
          },
        },
        [State.READY]: {
          on: {
            UPDATE_SELECTED_LABEL_PRINTER: {
              actions: [
                Actions.ASSIGN_LABEL_PRINTER,
                Actions.NOTIFY_SUBSCRIBERS,
              ],
            },
            UPDATE_LABEL_PRINTER: {
              actions: [
                Actions.ASSIGN_LABEL_PRINTER,
                Actions.NOTIFY_SUBSCRIBERS,
              ],
            },
            PRINT: {
              target: State.PRINTING,
            },
          },
        },
        [State.PRINTING]: {
          invoke: {
            id: "printLabels",
            src: Services.PRINT_LABELS,
            onDone: {
              target: State.READY,
              actions: Actions.NOTIFY_PARENT_SUCCESS,
            },
            onError: {
              target: State.READY,
              actions: Actions.NOTIFY_PARENT_ERROR,
            },
          },
        },
      },
    },
    labelPrinterMachineOptions
  );
