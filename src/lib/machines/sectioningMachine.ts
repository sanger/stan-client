import { Maybe } from "../../types/graphql";
import labwareMachine, {
  LabwareMachineContext,
  LabwareMachineEvents,
  LabwareMachineType,
} from "./labwareMachine";
import { Actor, assign, Machine, spawn } from "xstate";

/**
 * Context for the {@link sectioningMachine}
 */
interface SectioningMachineContext {
  /**
   * A spawned {@link labwareMachine} to track which blocks will be sectioned. State is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  labwareMachine: Maybe<
    Actor<LabwareMachineType["state"], LabwareMachineEvents>
  >;
}

/**
 * States in a {@link sectioningMachine}
 */
interface SectioningMachineStates {
  states: {
    init: {};
  };
}

/**
 * Machine for controlling the sectioning workflow.
 *
 * @see {@link labwareMachine}
 */
const sectioningMachine = Machine<
  SectioningMachineContext,
  SectioningMachineStates,
  never
>({
  key: "sectioningMachine",
  initial: "init",
  context: {
    labwareMachine: null,
  },
  states: {
    init: {
      entry: assign<SectioningMachineContext>({
        labwareMachine: () =>
          spawn<LabwareMachineContext, LabwareMachineEvents>(labwareMachine, {
            sync: true,
          }),
      }),
    },
  },
});

export default sectioningMachine;
