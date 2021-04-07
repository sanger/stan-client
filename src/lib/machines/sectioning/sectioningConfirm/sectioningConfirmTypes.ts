import { ActorRef, Interpreter } from "xstate";
import { LayoutPlan } from "../../layout/layoutContext";
import {
  Comment,
  ConfirmOperationLabware,
  LabwareFieldsFragment as LabwareLayout,
} from "../../../../types/graphql";
import { Address } from "../../../../types/stan";

export type SectioningConfirmMachineType = Interpreter<
  SectioningConfirmContext,
  SectioningConfirmSchema,
  SectioningConfirmEvent
>;

export type SectioningConfirmActorRef = ActorRef<
  SectioningConfirmEvent,
  SectioningConfirmMachineType["state"]
>;

//region S
export enum State {
  INIT = "init",
  CANCELLABLE_MODE = "cancellableMode",
  EDITABLE_MODE = "editableMode",
  EDITING_LAYOUT = "editingLayout",
  DONE = "done",
}

export interface SectioningConfirmSchema {
  states: {
    [State.INIT]: {};
    [State.CANCELLABLE_MODE]: {};
    [State.EDITABLE_MODE]: {};
    [State.EDITING_LAYOUT]: {};
    [State.DONE]: {};
  };
}
//endregion

//region Context
export interface SectioningConfirmContext {
  /**
   * The layout plan created in the plan stage
   */
  originalLayoutPlan: LayoutPlan;

  /**
   * The current layout (some sections may have not been done in the end)
   */
  layoutPlan: LayoutPlan;

  /**
   * The destination labware
   */
  labware: LabwareLayout;

  /**
   * All comments available for the outcome confirmation
   */
  comments: Array<Comment>;

  /**
   * Map of labware address to comment ID
   */
  addressToCommentMap: Map<Address, number>;

  /**
   * Has this labware been cancelled (relevant only for tubes)
   */
  cancelled: boolean;
}
//endregion

//region Events
type SetCommentForAddressEvent = {
  type: "SET_COMMENT_FOR_ADDRESS";
  address: string;
  commentId: string;
};

type SetCommentForAllEvent = {
  type: "SET_COMMENT_FOR_ALL";
  commentId: string;
};

type EditLayoutEvent = { type: "EDIT_LAYOUT" };

type CancelEditLayoutEvent = { type: "CANCEL_EDIT_LAYOUT" };

type DoneEditLayoutEvent = { type: "DONE_EDIT_LAYOUT" };

export type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

type ToggleCancelEvent = { type: "TOGGLE_CANCEL" };

export type CommitConfirmationEvent = {
  type: "COMMIT_CONFIRMATION";
  confirmOperationLabware: ConfirmOperationLabware;
};

export type SectioningConfirmationCompleteEvent = {
  type: "SECTIONING_CONFIRMATION_COMPLETE";
};

export type SectioningConfirmEvent =
  | SetCommentForAddressEvent
  | SetCommentForAllEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | LayoutMachineDone
  | ToggleCancelEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent;
//endregion
