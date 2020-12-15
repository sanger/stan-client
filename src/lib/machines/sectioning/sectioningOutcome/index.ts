import { SectioningOutcomeEvents } from "./sectioningOutcomeEvents";
import { SectioningOutcomeContext } from "./sectioningOutcomeContext";
import { SectioningOutcomeSchema } from "./sectioningOutcomeStates";
import { createSectioningOutcomeMachine } from "./sectioningOutcomeMachine";
import { Interpreter } from "xstate";

type SectioningOutcomeMachineType = Interpreter<
  SectioningOutcomeContext,
  SectioningOutcomeSchema,
  SectioningOutcomeEvents
>;

export default createSectioningOutcomeMachine;

export type {
  SectioningOutcomeMachineType,
  SectioningOutcomeSchema,
  SectioningOutcomeContext,
  SectioningOutcomeEvents
};