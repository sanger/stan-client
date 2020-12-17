import {
  SectioningConfirmContext,
  SectioningConfirmEvent,
} from "./sectioningConfirmTypes";

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

export function commitConfirmation(
  ctx: SectioningConfirmContext
): SectioningConfirmEvent {
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
