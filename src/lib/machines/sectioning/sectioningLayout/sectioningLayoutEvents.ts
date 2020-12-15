import { PlanMutationResult } from "../../../../types/graphql";
import { ApolloError } from "@apollo/client";
import { SectioningLayout } from "./index";
import {
  PrintErrorEvent,
  PrintSuccessEvent,
} from "../../labelPrinter/labelPrinterEvents";
import { LayoutPlan } from "../../layout/layoutContext";

type UpdateSectioningLayoutEvent = {
  type: "UPDATE_SECTIONING_LAYOUT";
  sectioningLayout: Partial<SectioningLayout>;
};
export function updateSectioningLayout(
  sectioningLayout: Partial<SectioningLayout>
): UpdateSectioningLayoutEvent {
  return {
    type: "UPDATE_SECTIONING_LAYOUT",
    sectioningLayout,
  };
}

type EditLayoutEvent = { type: "EDIT_LAYOUT" };
export function editLayout(): EditLayoutEvent {
  return { type: "EDIT_LAYOUT" };
}

type CancelEditLayoutEvent = { type: "CANCEL_EDIT_LAYOUT" };
export function cancelEditLayout(): CancelEditLayoutEvent {
  return { type: "CANCEL_EDIT_LAYOUT" };
}

type DoneEditLayoutEvent = { type: "DONE_EDIT_LAYOUT" };
export function doneEditLayout(): DoneEditLayoutEvent {
  return { type: "DONE_EDIT_LAYOUT" };
}

type CreateLabwareEvent = { type: "CREATE_LABWARE" };
export function createLabware(): CreateLabwareEvent {
  return { type: "CREATE_LABWARE" };
}

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

export type SectioningLayoutEvents =
  | UpdateSectioningLayoutEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | PrintSuccessEvent
  | PrintErrorEvent;
