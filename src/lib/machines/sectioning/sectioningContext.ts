import {
  ConfirmOperationLabware,
  ConfirmOperationRequest,
  GetSectioningInfoQuery,
  Labware,
  LabwareType,
  Maybe,
  PlanMutation,
} from "../../../types/graphql";
import { ActorRef } from "xstate";
import { SectioningLayoutMachineType } from "./sectioningLayout/sectioningLayoutMachine";
import { SectioningLayout, SectioningLayoutEvents } from "./sectioningLayout";
import { LabwareEvents, LabwareMachineType } from "../labware";
import {
  SectioningOutcomeEvents,
  SectioningOutcomeMachineType,
} from "./sectioningOutcome";

interface SectioningLayoutMachineRef {
  ref: ActorRef<SectioningLayoutEvents, SectioningLayoutMachineType["state"]>;
}

interface SectioningOutcomeMachineRef {
  ref: ActorRef<SectioningOutcomeEvents, SectioningOutcomeMachineType["state"]>;
}

/**
 * SectioningContext for the {@link sectioningMachine}
 */
export interface SectioningContext {
  /**
   * Allowed input labware types
   */
  inputLabwareTypeNames: string[];

  /**
   * Actual input labware types
   */
  inputLabwareTypes: GetSectioningInfoQuery["labwareTypes"];

  /**
   * Allowed output labware types
   */
  outputLabwareTypeNames: string[];

  /**
   * Actual output labware types
   */
  outputLabwareTypes: GetSectioningInfoQuery["labwareTypes"];

  /**
   * Labware Type selected by the user
   */
  selectedLabwareType: Maybe<LabwareType>;

  /**
   * A spawned {@link labwareMachine} to track which blocks will be sectioned. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  labwareMachine: Maybe<ActorRef<LabwareEvents, LabwareMachineType["state"]>>;

  /**
   * The input labwares sent up from the labware machine
   */
  sourceLabwares: Labware[];

  /**
   * Spawned {@link sectioningLayoutMachine}s. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  sectioningLayouts: Array<SectioningLayout & SectioningLayoutMachineRef>;

  /**
   * A map of sample ID to a hex color
   */
  sampleColors: Map<number, string>;

  /**
   * The request to send to the ConfirmOperation mutation
   */
  confirmOperationLabware: Array<
    ConfirmOperationLabware & SectioningOutcomeMachineRef
  >;
}

export {};
