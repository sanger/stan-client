import {
  Comment,
  ConfirmOperationRequest,
  GetSectioningInfoQuery,
  Labware,
  LabwareType,
  Maybe,
} from "../../../types/graphql";
import { Interpreter } from "xstate";
import { LabwareMachineActorRef } from "../labware";
import { UpdateLabwaresEvent } from "../labware/labwareEvents";
import {
  CommitConfirmationEvent,
  SectioningOutcomeActorRef,
} from "./sectioningOutcome/sectioningOutcomeTypes";
import {
  PlanSectionResolveEvent,
  PrepCompleteEvent,
  SectioningLayout,
  SectioningLayoutActorRef,
} from "./sectioningLayout/sectioningLayoutTypes";

export type SectioningMachineType = Interpreter<
  SectioningContext,
  SectioningSchema,
  SectioningEvent
>;

//region Sectioning States
export enum State {
  LOADING = "loading",
  UNKNOWN = "unknown",
  ERROR = "error",
  READY = "ready",
  STARTED = "started",
  SOURCE_SCANNING = "sourceScanning",
  PREPARING_LABWARE = "preparingLabware",
  OUTCOMES = "outcome",
}

export interface SectioningSchema {
  states: {
    [State.LOADING]: {};
    [State.UNKNOWN]: {};
    [State.ERROR]: {};
    [State.READY]: {};
    [State.STARTED]: {
      states: {
        [State.SOURCE_SCANNING]: {};
        [State.PREPARING_LABWARE]: {};
      };
    };
    [State.OUTCOMES]: {};
  };
}
//endregion

//region Context Types
interface SectioningLayoutMachineRef {
  ref: SectioningLayoutActorRef;
}

/**
 * SectioningContext for the sectioningMachine
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
   * Available comments for confirmation
   */
  comments: Comment[];

  /**
   * Labware Type selected by the user
   */
  selectedLabwareType: Maybe<LabwareType>;

  /**
   * A spawned {@link labwareMachine} to track which blocks will be sectioned. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  labwareMachine: Maybe<LabwareMachineActorRef>;

  /**
   * The input labwares sent up from the labware machine
   */
  sourceLabwares: Labware[];

  /**
   * Spawned sectioningLayoutMachines. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  sectioningLayouts: Array<SectioningLayout & SectioningLayoutMachineRef>;

  /**
   * The number of sectioning layouts that have completed (either successfully printed or just created for Visium LP)
   */
  numSectioningLayoutsComplete: number;

  /**
   * A map of sample ID to a hex color
   */
  sampleColors: Map<number, string>;

  /**
   * A map of labware type names to machines handling each labware's sectioning outcome
   */
  sectioningOutcomeMachines: Map<string, Array<SectioningOutcomeActorRef>>;

  /**
   * The request that will be send to the API at the end of Sectioning
   */
  confirmOperationRequest: ConfirmOperationRequest;
}
//endregion Types T

//region Event Types
type SelectLabwareTypeEvent = {
  type: "SELECT_LABWARE_TYPE";
  labwareType: GetSectioningInfoQuery["labwareTypes"][number];
};

type AddLabwareLayoutEvent = {
  type: "ADD_LABWARE_LAYOUT";
};

type GetSectioningInfoResolveEvent = {
  type: "done.invoke.getSectioningInfo";
  data: GetSectioningInfoQuery;
};

type DeleteLabwareLayoutEvent = {
  type: "DELETE_LABWARE_LAYOUT";
  index: number;
};

type PrepDoneEvent = {
  type: "PREP_DONE";
};

type BackToPrepEvent = {
  type: "BACK_TO_PREP";
};

export type SectioningEvent =
  | SelectLabwareTypeEvent
  | AddLabwareLayoutEvent
  | DeleteLabwareLayoutEvent
  | GetSectioningInfoResolveEvent
  | UpdateLabwaresEvent
  | PrepDoneEvent
  | BackToPrepEvent
  | PlanSectionResolveEvent
  | CommitConfirmationEvent
  | PrepCompleteEvent;
//endregion
