import {
  Comment,
  ConfirmOperationRequest,
  ConfirmOperationResult,
  GetSectioningInfoQuery,
  LabwareFieldsFragment,
  LabwareType,
  Maybe,
} from "../../../types/graphql";
import { Interpreter, State, StateNode } from "xstate";
import { UpdateLabwaresEvent } from "../labware/labwareMachineTypes";
import {
  CommitConfirmationEvent,
  SectioningConfirmActorRef,
} from "./sectioningConfirm/sectioningConfirmTypes";
import {
  PlanSectionResolveEvent,
  PrepCompleteEvent,
  SectioningLayout,
  SectioningLayoutActorRef,
} from "./sectioningLayout/sectioningLayoutTypes";

export type SectioningMachineService = Interpreter<
  SectioningContext,
  SectioningSchema,
  SectioningEvent
>;

export type SectioningMachine = StateNode<
  SectioningContext,
  SectioningSchema,
  SectioningEvent
>;

//region Sectioning S
export enum S {
  UNKNOWN = "unknown",
  ERROR = "error",
  READY = "ready",
  STARTED = "started",
  SOURCE_SCANNING = "sourceScanning",
  PREPARING_LABWARE = "preparingLabware",
  CONFIRMING_LABWARE = "confirmingLabware",
  CONFIRMING = "confirming",
  CONFIRM_OPERATION = "confirmOperation",
  CONFIRM_ERROR = "confirmError",
  DONE = "done",
}

export interface SectioningSchema {
  states: {
    [S.UNKNOWN]: {};
    [S.ERROR]: {};
    [S.READY]: {};
    [S.STARTED]: {
      states: {
        [S.SOURCE_SCANNING]: {};
        [S.PREPARING_LABWARE]: {};
      };
    };
    [S.CONFIRMING]: {
      states: {
        [S.CONFIRMING_LABWARE]: {};
        [S.CONFIRM_OPERATION]: {};
        [S.CONFIRM_ERROR]: {};
      };
    };
    [S.DONE]: {};
  };
}

export type SectioningState = State<
  SectioningContext,
  SectioningEvent,
  SectioningSchema
>;
//endregion

//region Context LocationSearchParams
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
   * The input labwares sent up from the labware machine
   */
  sourceLabwares: LabwareFieldsFragment[];

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
  sectioningConfirmMachines: Map<string, Array<SectioningConfirmActorRef>>;

  /**
   * The request that will be send to the API at the end of Sectioning
   */
  confirmOperationRequest: ConfirmOperationRequest;

  /**
   * The successful of the Confirm Operation API call
   */
  confirmedOperation: Maybe<ConfirmOperationResult>;
}
//endregion LocationSearchParams T

//region Event LocationSearchParams
type SelectLabwareTypeEvent = {
  type: "SELECT_LABWARE_TYPE";
  labwareType: GetSectioningInfoQuery["labwareTypes"][number];
};

type AddLabwareLayoutEvent = {
  type: "ADD_LABWARE_LAYOUT";
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

type ConfirmOperationEvent = {
  type: "CONFIRM_OPERATION";
};

type ConfirmOperationResolveEvent = {
  type: "done.invoke.confirmOperation";
  data: ConfirmOperationResult;
};

export type SectioningEvent =
  | SelectLabwareTypeEvent
  | AddLabwareLayoutEvent
  | DeleteLabwareLayoutEvent
  | UpdateLabwaresEvent
  | PrepDoneEvent
  | BackToPrepEvent
  | PlanSectionResolveEvent
  | CommitConfirmationEvent
  | PrepCompleteEvent
  | ConfirmOperationEvent
  | ConfirmOperationResolveEvent;
//endregion
