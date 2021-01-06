import { Machine } from "xstate";
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
import { defaults } from "lodash";

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
      context: buildContext(labelPrinter, options),
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
              actions: [Actions.ASSIGN_LABEL_PRINTER],
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
              actions: [Actions.ASSIGN_LABEL_PRINTER],
            },
            UPDATE_LABEL_PRINTER: {
              actions: [Actions.ASSIGN_LABEL_PRINTER],
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

function buildContext(
  labelPrinter: Partial<LabelPrinter>,
  options?: Partial<LabelPrinterOptions>
): LabelPrinterContext {
  const ctxLabelPrinter: LabelPrinter = defaults(labelPrinter, {
    printers: [],
    selectedPrinter: null,
    labwares: [],
  });

  const availableLabelTypes = new Set(
    ctxLabelPrinter.labwares.map((lw) => lw.labwareType?.labelType?.name)
  );

  // Only have available printers of the passed in label type (if there is one)
  ctxLabelPrinter.printers = ctxLabelPrinter.printers.filter((printer) =>
    availableLabelTypes.has(printer.labelType.name)
  );

  return {
    labelPrinter: ctxLabelPrinter,
    options: defaults(options, { fetchPrinters: true }),
  };
}
