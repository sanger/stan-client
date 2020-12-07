import { LabwareEvents } from "./labwareEvents";
import { LabwareContext } from "./labwareContext";
import { LabwareSchema } from "./labwareStates";
import { createLabwareMachine } from "./labwareMachine";
import { Interpreter } from "xstate";

type LabwareMachineType = Interpreter<
  LabwareContext,
  LabwareSchema,
  LabwareEvents
>;

export default createLabwareMachine;

export type {
  LabwareMachineType,
  LabwareSchema,
  LabwareContext,
  LabwareEvents
};