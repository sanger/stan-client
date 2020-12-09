import { LabelPrinterEvents } from "./labelPrinterEvents";
import { LabelPrinterContext } from "./labelPrinterContext";
import { LabelPrinterSchema } from "./labelPrinterStates";
import { createLabelPrinterMachine } from "./labelPrinterMachine";
import { Interpreter } from "xstate";

type LabelPrinterMachineType = Interpreter<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvents
>;

export default createLabelPrinterMachine;

export type {
  LabelPrinterMachineType,
  LabelPrinterSchema,
  LabelPrinterContext,
  LabelPrinterEvents
};