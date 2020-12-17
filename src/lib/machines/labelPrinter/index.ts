import { LabelPrinterEvents } from "./labelPrinterEvents";
import { LabelPrinterContext } from "./labelPrinterContext";
import { LabelPrinterSchema } from "./labelPrinterStates";
import { createLabelPrinterMachine } from "./labelPrinterMachine";
import { ActorRef, Interpreter } from "xstate";

type LabelPrinterMachineType = Interpreter<
  LabelPrinterContext,
  LabelPrinterSchema,
  LabelPrinterEvents
>;

export type LabelPrinterActorRef = ActorRef<
  LabelPrinterEvents,
  LabelPrinterMachineType["state"]
>;

export default createLabelPrinterMachine;

export type {
  LabelPrinterMachineType,
  LabelPrinterSchema,
  LabelPrinterContext,
  LabelPrinterEvents,
};
