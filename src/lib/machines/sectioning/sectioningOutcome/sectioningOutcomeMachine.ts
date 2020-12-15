import { Machine } from "xstate";
import { SectioningOutcomeContext } from "./sectioningOutcomeContext";
import { SectioningOutcomeSchema, State } from "./sectioningOutcomeStates";
import { SectioningOutcomeEvents } from "./sectioningOutcomeEvents";
import { Actions, machineOptions } from "./sectioningOutcomeMachineOptions";
import {
  ConfirmOperationLabware,
  LabwareLayoutFragment as LabwareLayout,
} from "../../../../types/graphql";

/**
 * SectioningOutcome State Machine
 */
export const createSectioningOutcomeMachine = (
  comments: Array<Comment>,
  labware: LabwareLayout
) =>
  Machine<
    SectioningOutcomeContext,
    SectioningOutcomeSchema,
    SectioningOutcomeEvents
  >(
    {
      id: "sectioningOutcome",
      initial: State.READY,
      states: {
        [State.READY]: {},
        [State.EDITING_LAYOUT]: {},
      },
    },
    machineOptions
  );
