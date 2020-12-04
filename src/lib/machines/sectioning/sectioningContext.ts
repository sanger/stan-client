import {
  GetSectioningInfoQuery,
  Labware,
  LabwareType,
  Maybe,
} from "../../../types/graphql";
import { Actor } from "xstate";
import { LabwareMachineEvents, LabwareMachineType } from "../labwareMachine";
import { SectioningLayoutMachineType } from "./sectioningLayout/sectioningLayoutMachine";
import { SectioningLayoutEvents } from "./sectioningLayout";
import { SectioningLayout } from "./sectioningMachine";

interface SectioningMachineRef {
  ref: Actor<SectioningLayoutMachineType["state"], SectioningLayoutEvents>;
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
  labwareMachine: Maybe<
    Actor<LabwareMachineType["state"], LabwareMachineEvents>
  >;

  /**
   * The input labwares sent up from the labware machine
   */
  sourceLabwares: Labware[];

  /**
   * Spawned {@link sectioningLayoutMachine}s. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  sectioningLayouts: Array<SectioningLayout & SectioningMachineRef>;

  /**
   * A map of sample color to a hex color
   */
  sampleColors: Map<number, string>;
}

export {};
