import { Machine } from "xstate";
import { SectioningOutcomeContext } from "./sectioningOutcomeContext";
import { SectioningOutcomeSchema, State } from "./sectioningOutcomeStates";
import { SectioningOutcomeEvents } from "./sectioningOutcomeEvents";
import { Actions, machineOptions } from "./sectioningOutcomeMachineOptions";
import { LabwareLayoutFragment as LabwareLayout } from "../../../../types/graphql";
import { LayoutPlan } from "../../layout/layoutContext";

/**
 * SectioningOutcome State Machine
 */
export const createSectioningOutcomeMachine = (
  comments: Array<Comment>,
  labware: LabwareLayout,
  layoutPlan: LayoutPlan
) =>
  Machine<
    SectioningOutcomeContext,
    SectioningOutcomeSchema,
    SectioningOutcomeEvents
  >(
    {
      id: "sectioningOutcome",
      initial: State.READY,
      context: {
        comments,
        labware,
        layoutPlan,
      },
      states: {
        [State.READY]: {},
        [State.EDITING_LAYOUT]: {},
      },
    },
    machineOptions
  );
