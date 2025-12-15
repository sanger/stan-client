import { ActorRef, assign, createMachine } from 'xstate';
import {
  AddressCommentInput,
  Comment,
  ConfirmOperationLabware,
  ConfirmSection,
  ConfirmSectionLabware,
  Maybe
} from '../../types/sdk';
import { LayoutPlan, Source } from '../../lib/machines/layout/layoutContext';
import { cloneDeep } from 'lodash';
import { NewFlaggedLabwareLayout } from '../../types/stan';
import { produce } from '../../dependencies/immer';

export interface ConfirmLabwareContext {
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
  labware: NewFlaggedLabwareLayout;

  /**
   * All comments available for the outcome confirmation
   */
  comments: Array<Comment>;

  /**
   * All comments available for the outcome confirmation
   */
  commentsForAllSections: string[];

  /**
   * Has this labware been cancelled (relevant only for tubes)
   */
  cancelled: boolean;

  confirmSectionLabware: Maybe<ConfirmSectionLabware>;

  /**
   * Actor reference to the layout machine, so the spawned machine can be accessed from the context
   */
  layoutMachine?: ActorRef<any, any>;

  /**
   * A boolean flags indicating the machine event. This is primarily used as a replacement for assertions based on context.event.type,
   * given that the event object has been removed from the context in XState v5.
   * In the current (snapshot, using the new terminology in XState v5), only context parameters are directly accessible.
   */
  isCancelToggled?: boolean;
  isLayoutUpdated?: boolean;

  /**
   * The work number associated with the labware confirmation process.
   * This is an optional field that can be used to apply the same work number to all sectioning plans.
   */
  workNumber?: string;
}

type SetCommentsForSectionEvent = {
  type: 'SET_COMMENTS_FOR_SECTION';
  sectionGroupId: string;
  commentIds: string[];
};

type SetCommentForAllEvent = {
  type: 'SET_COMMENT_FOR_ALL';
  commentIds: string[];
};

type ToggleCancelEvent = { type: 'TOGGLE_CANCEL' };

type UpdateSectionNumberEvent = {
  type: 'UPDATE_SECTION_NUMBER';
  sectionGroupId: string;
  sectionNumber: number;
};
export type CommitConfirmationEvent = {
  type: 'COMMIT_CONFIRMATION';
  confirmOperationLabware: ConfirmOperationLabware;
};

export type SectioningConfirmationCompleteEvent = {
  type: 'SECTIONING_CONFIRMATION_COMPLETE';
};

type AssignSectionWorkNumber = {
  type: 'UPDATE_SECTION_WORK_NUMBER';
  labware: ConfirmSectionLabware;
  workNumber: string;
};

type UpdateSectionThicknessEvent = {
  type: 'UPDATE_SECTION_THICKNESS';
  thickness: string;
  sectionGroupId: string;
};

export type ConfirmLabwareEvent =
  | SetCommentsForSectionEvent
  | SetCommentForAllEvent
  | ToggleCancelEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent
  | UpdateSectionNumberEvent
  | AssignSectionWorkNumber
  | UpdateSectionThicknessEvent;

function buildConfirmSection(destinationAddresses: Array<string>, source: Source): ConfirmSection {
  return {
    destinationAddresses,
    newSection: source.newSection,
    thickness: source.sampleThickness,
    sampleId: source.sampleId,
    commentIds: source.commentIds
  };
}
/**
 * ConfirmLabware Machine
 */
export const createConfirmLabwareMachine = (
  comments: Array<Comment>,
  labware: NewFlaggedLabwareLayout,
  layoutPlan: LayoutPlan,
  workNumber: string
) =>
  createMachine(
    {
      id: 'sectioningOutcome',
      types: {} as {
        context: ConfirmLabwareContext;
        events: ConfirmLabwareEvent;
      },
      initial: 'editableMode',
      context: {
        comments,
        labware,
        workNumber,
        originalLayoutPlan: cloneDeep(layoutPlan),
        layoutPlan: cloneDeep(layoutPlan),
        cancelled: false,
        confirmSectionLabware: null,
        commentsForAllSections: []
      },
      on: {
        SECTIONING_CONFIRMATION_COMPLETE: '.done'
      },
      entry: 'commitConfirmation',
      states: {
        editableMode: {
          on: {
            TOGGLE_CANCEL: {
              actions: ['toggleCancel', 'commitConfirmation']
            },
            SET_COMMENTS_FOR_SECTION: {
              actions: ['assignSectionAddressComment', 'commitConfirmation']
            },
            SET_COMMENT_FOR_ALL: {
              actions: ['assignAllComment', 'commitConfirmation']
            },
            UPDATE_SECTION_THICKNESS: {
              actions: ['updateSectionThickness', 'commitConfirmation']
            },
            UPDATE_SECTION_NUMBER: {
              actions: ['updateSectionNumber', 'commitConfirmation']
            },
            UPDATE_SECTION_WORK_NUMBER: {
              actions: 'assignSectionWorkNumber'
            }
          }
        },
        done: {
          type: 'final'
        }
      }
    },
    {
      actions: {
        assignSectionAddressComment: assign(({ context, event }) => {
          if (event.type !== 'SET_COMMENTS_FOR_SECTION') {
            return context;
          }
          return produce(context, (draft) => {
            draft.layoutPlan.plannedActions[event.sectionGroupId].source.commentIds = event.commentIds.map(
              (commentID) => Number(commentID)
            );
          });
        }),
        /**
         * Assign all the addresses with planned actions in the same comment
         */
        assignAllComment: assign(({ context, event }) => {
          if (event.type !== 'SET_COMMENT_FOR_ALL') {
            return context;
          }
          return produce(context, (draft) => {
            Object.values(draft.layoutPlan.plannedActions).forEach((planned) => {
              // draft.addressToCommentMap.set(key, Number(event.commentIds[0]));
              planned.source.commentIds = event.commentIds.map((commentID) => Number(commentID));
            });
            draft.commentsForAllSections = event.commentIds;
          });
        }),
        /**
         * Toggles whether this labware was used or not
         */
        toggleCancel: assign(({ context, event }) => {
          if (event.type !== 'TOGGLE_CANCEL') {
            return context;
          }
          return { ...context, cancelled: !context.cancelled, isCancelToggled: true };
        }),
        updateSectionNumber: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_NUMBER') {
            return context;
          }
          return produce(context, (draft) => {
            const plannedAction = draft.layoutPlan.plannedActions[event.sectionGroupId];

            if (plannedAction) {
              plannedAction.source.newSection = event.sectionNumber;
            }
          });
        }),
        updateSectionThickness: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_THICKNESS') {
            return context;
          }
          return produce(context, (draft) => {
            draft.layoutPlan.plannedActions[event.sectionGroupId].source.sampleThickness = event.thickness;
          });
        }),
        commitConfirmation: assign(({ context }) => {
          const confirmSections: Array<ConfirmSection> = [];
          Object.values(context.layoutPlan.plannedActions).forEach((plannedAction) => {
            confirmSections.push(buildConfirmSection(Array.from(plannedAction.addresses), plannedAction.source));
          });
          let addressComments: AddressCommentInput[] = [];
          Object.values(context.layoutPlan.plannedActions).forEach((planned) => {
            planned.addresses.forEach((address) => {
              planned.source.commentIds?.forEach((commentId) => {
                addressComments.push({ address, commentId });
              });
            });
          });
          const confirmSectionLabware = {
            workNumber: context.confirmSectionLabware?.workNumber || workNumber,
            barcode: context.labware.barcode!,
            cancelled: context.cancelled,
            confirmSections: context.cancelled ? undefined : confirmSections,
            addressComments: []
          };
          return { ...context, workNumber, confirmSectionLabware };
        }),
        cancelEditLayout: assign(({ context }) => {
          return context;
        }),
        assignSectionWorkNumber: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_WORK_NUMBER') return context;
          return {
            ...context,
            confirmSectionLabware: { ...context.confirmSectionLabware!, workNumber: event.workNumber }
          };
        })
      }
    }
  );
