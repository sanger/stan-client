import { LabwareEvents } from "./labwareEvents";
import { LabwareContext } from "./labwareContext";
import { LabwareSchema } from "./labwareStates";
import { createLabwareMachine } from "./labwareMachine";
import { ActorRef, Interpreter } from "xstate";

type LabwareMachineType = Interpreter<
  LabwareContext,
  LabwareSchema,
  LabwareEvents
>;

export type LabwareMachineActorRef = ActorRef<
  LabwareEvents,
  LabwareMachineType["state"]
>;

export default createLabwareMachine;

export type {
  LabwareMachineType,
  LabwareSchema,
  LabwareContext,
  LabwareEvents,
};
