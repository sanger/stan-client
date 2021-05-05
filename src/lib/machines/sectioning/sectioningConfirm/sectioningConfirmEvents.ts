import {
  SectioningConfirmContext,
  SectioningConfirmEvent,
} from "./sectioningConfirmTypes";
import { CancelPlanAction } from "../../../../types/sdk";
import { Source } from "../../layout/layoutContext";
import { find } from "lodash";

export function setCommentForAddress(
  address: string,
  commentId: string
): SectioningConfirmEvent {
  return {
    type: "SET_COMMENT_FOR_ADDRESS",
    address,
    commentId,
  };
}

export function setCommentForAll(commentId: string): SectioningConfirmEvent {
  return {
    type: "SET_COMMENT_FOR_ALL",
    commentId,
  };
}

export function editLayout(): SectioningConfirmEvent {
  return { type: "EDIT_LAYOUT" };
}

export function cancelEditLayout(): SectioningConfirmEvent {
  return { type: "CANCEL_EDIT_LAYOUT" };
}

export function doneEditLayout(): SectioningConfirmEvent {
  return { type: "DONE_EDIT_LAYOUT" };
}

export function toggleCancel(): SectioningConfirmEvent {
  return { type: "TOGGLE_CANCEL" };
}

function buildCancelPlanAction(
  destinationAddress: string,
  plannedAction: Source
): CancelPlanAction {
  return {
    destinationAddress,
    newSection: plannedAction.newSection,
    sampleId: plannedAction.sampleId,
  };
}

function buildCancelPlanActions(
  destinationAddress: string,
  plannedActions: Array<Source>
): Array<CancelPlanAction> {
  return plannedActions.map((action) =>
    buildCancelPlanAction(destinationAddress, action)
  );
}

export function commitConfirmation(
  ctx: SectioningConfirmContext
): SectioningConfirmEvent {
  const cancelledActions: Array<CancelPlanAction> = [];
  const confirmPlannedActions = ctx.layoutPlan.plannedActions;

  for (let [
    destinationAddress,
    originalPlannedActions,
  ] of ctx.originalLayoutPlan.plannedActions.entries()) {
    const plannedActions = confirmPlannedActions.get(destinationAddress) ?? [];

    // Find all the original planned actions that are now missing after layout confirmation
    let missingOriginalActions: Array<Source> = originalPlannedActions.filter(
      (action) =>
        !find(plannedActions, {
          sampleId: action.sampleId,
          newSection: action.newSection,
          address: action.address,
        })
    );

    cancelledActions.push(
      ...buildCancelPlanActions(destinationAddress, missingOriginalActions)
    );
  }

  return {
    type: "COMMIT_CONFIRMATION",
    confirmOperationLabware: {
      barcode: ctx.labware.barcode,
      cancelled: ctx.cancelled,
      cancelledActions,
      addressComments: Array.from(
        ctx.addressToCommentMap.entries()
      ).map(([address, commentId]) => ({ address, commentId })),
    },
  };
}

export function sectioningConfirmationComplete(): SectioningConfirmEvent {
  return {
    type: "SECTIONING_CONFIRMATION_COMPLETE",
  };
}
