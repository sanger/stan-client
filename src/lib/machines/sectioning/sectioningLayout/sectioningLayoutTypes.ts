import {
  LabwareFieldsFragment,
  Maybe,
  PlanMutation,
  PlanMutationResult,
} from "../../../../types/graphql";
import { NewLabwareLayout, ServerErrors } from "../../../../types/stan";
import { ActorRef, Interpreter } from "xstate";
import * as Yup from "yup";
import { LayoutMachineActorRef } from "../../layout";
import { LayoutPlan } from "../../layout/layoutContext";
import { ApolloError } from "@apollo/client";

export type SectioningLayoutMachineType = Interpreter<
  SectioningLayoutContext,
  SectioningLayoutSchema,
  SectioningLayoutEvent
>;

export type SectioningLayoutActorRef = ActorRef<
  SectioningLayoutEvent,
  SectioningLayoutMachineType["state"]
>;

//region S
export enum State {
  PREP = "prep",
  VALID = "valid",
  INVALID = "invalid",
  ERROR = "error",
  EDITING_LAYOUT = "editingLayout",
  VALIDATING = "validating",
  CREATING = "creating",
  PRINTING = "printing",
  DONE = "done",
}

export interface SectioningLayoutSchema {
  states: {
    [State.PREP]: {
      states: {
        [State.VALID]: {};
        [State.INVALID]: {};
        [State.ERROR]: {};
      };
    };
    [State.EDITING_LAYOUT]: {};
    [State.VALIDATING]: {};
    [State.CREATING]: {};
    [State.PRINTING]: {};
    [State.DONE]: {};
  };
}
//endregion

//region Context
/**
 * Context for a {@link SectioningLayout} machine
 */
export interface SectioningLayoutContext {
  /**
   * Errors returned from the server
   */
  serverErrors: Maybe<ServerErrors>;

  /**
   * A sectioning layout
   */
  sectioningLayout: SectioningLayout;

  /**
   * Yup validator for validating the sectioning layout
   */
  validator: Yup.ObjectSchema;

  /**
   * The planner operations returned from the plan mutation
   */
  plannedOperations: PlanMutation["plan"]["operations"];

  /**
   * The planned labware returned from the plan mutation
   */
  plannedLabware: Array<PlanMutation["plan"]["labware"][number]>;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;

  /**
   * A layout plan
   */
  layoutPlan: LayoutPlan;

  /**
   * Message from the label printer containing details of the printer's success
   */
  printSuccessMessage?: string;

  /**
   * Message from the label printer containing details of how the printer failed
   */
  printErrorMessage?: string;
}
//endregion

//region Events
type UpdateSectioningLayoutEvent = {
  type: "UPDATE_SECTIONING_LAYOUT";
  sectioningLayout: Partial<SectioningLayout>;
};

type EditLayoutEvent = { type: "EDIT_LAYOUT" };

type CancelEditLayoutEvent = { type: "CANCEL_EDIT_LAYOUT" };

type DoneEditLayoutEvent = { type: "DONE_EDIT_LAYOUT" };

type CreateLabwareEvent = { type: "CREATE_LABWARE" };

type UpdateLayoutPlanEvent = {
  type: "UPDATE_LAYOUT_PLAN";
  layoutPlan: LayoutPlan;
};

export type PlanSectionResolveEvent = {
  type: "done.invoke.planSection";
  data: PlanMutationResult;
};

type PlanSectionRejectEvent = {
  type: "error.platform.planSection";
  data: ApolloError;
};

export type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

export type PrepCompleteEvent = { type: "PREP_COMPLETE" };

export type SectioningLayoutEvent =
  | UpdateSectioningLayoutEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | LayoutMachineDone
  | PrepCompleteEvent;
//endregion

/**
 * Model of a sectioning layout
 */
export interface SectioningLayout {
  /**
   * The labwares available to section from
   */
  inputLabwares: LabwareFieldsFragment[];

  /**
   * The new labware we are sectioning on to
   */
  destinationLabware: NewLabwareLayout;

  /**
   * How many labwares of this layout will we be sectioning on to
   */
  quantity: number;

  /**
   * The thickness of each section (slice)
   */
  sectionThickness: number;

  /**
   * Map of sampleId to colors
   */
  sampleColors: Map<number, string>;

  /**
   * The barcode of the labware we're sectioning on to (for Visium LP slides)
   */
  barcode?: string;
}
