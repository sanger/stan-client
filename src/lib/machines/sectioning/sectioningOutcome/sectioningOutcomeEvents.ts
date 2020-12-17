import {
  SectioningOutcomeContext,
  SectioningOutcomeEvent,
} from "./sectioningOutcomeTypes";

export function setCommentForAddress(
  address: string,
  commentId: string
): SectioningOutcomeEvent {
  return {
    type: "SET_COMMENT_FOR_ADDRESS",
    address,
    commentId,
  };
}

export function setCommentForAll(commentId: string): SectioningOutcomeEvent {
  return {
    type: "SET_COMMENT_FOR_ALL",
    commentId,
  };
}

export function editLayout(): SectioningOutcomeEvent {
  return { type: "EDIT_LAYOUT" };
}

export function cancelEditLayout(): SectioningOutcomeEvent {
  return { type: "CANCEL_EDIT_LAYOUT" };
}

export function doneEditLayout(): SectioningOutcomeEvent {
  return { type: "DONE_EDIT_LAYOUT" };
}

export function toggleCancel(): SectioningOutcomeEvent {
  return { type: "TOGGLE_CANCEL" };
}

export function commitConfirmation(
  ctx: SectioningOutcomeContext
): SectioningOutcomeEvent {
  return {
    type: "COMMIT_CONFIRMATION",
    confirmOperationLabware: {
      barcode: ctx.labware.barcode,
      cancelled: ctx.cancelled,
      cancelledAddresses: ctx.cancelledAddresses,
      addressComments: Array.from(
        ctx.addressToCommentMap.entries()
      ).map(([address, comment]) => ({ address, comment })),
    },
  };
}
