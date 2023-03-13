import { createMachine } from 'xstate';
import { Comment, ConfirmOperationLabware, ConfirmSection, ConfirmSectionLabware, Maybe } from '../../types/sdk';
import { LayoutPlan, Source } from '../../lib/machines/layout/layoutContext';
import { assign } from '@xstate/immer';
import { createLayoutMachine } from '../../lib/machines/layout/layoutMachine';
import { cloneDeep } from 'lodash';
import { Address, NewLabwareLayout } from '../../types/stan';

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
  labware: NewLabwareLayout;

  /**
   * All comments available for the outcome confirmation
   */
  comments: Array<Comment>;

  /**
   * All comments available for the outcome confirmation
   */
  commentsForAllSections: string[];

  /**
   * Map of labware address to comment ID
   */
  addressToCommentMap: Map<Address, number>;

  /**
   * Has this labware been cancelled (relevant only for tubes)
   */
  cancelled: boolean;

  confirmSectionLabware: Maybe<ConfirmSectionLabware>;
}

type SetCommentForAddressEvent = {
  type: 'SET_COMMENT_FOR_ADDRESS';
  address: string;
  commentId: string;
};

type SetCommentsForSectionEvent = {
  type: 'SET_COMMENTS_FOR_SECTION';
  address: string;
  sectionIndex: number;
  commentIds: string[];
};

type SetRegionForSectionEvent = {
  type: 'SET_REGION_FOR_SECTION';
  address: string;
  sectionIndex: number;
  region: string;
};

type SetCommentForAllEvent = {
  type: 'SET_COMMENT_FOR_ALL';
  commentIds: string[];
};

type EditLayoutEvent = { type: 'EDIT_LAYOUT' };
type CancelEditLayoutEvent = { type: 'CANCEL_EDIT_LAYOUT' };
type DoneEditLayoutEvent = { type: 'DONE_EDIT_LAYOUT' };

export type LayoutMachineDone = {
  type: 'done.invoke.layoutMachine';
  data: { layoutPlan: LayoutPlan };
};

type ToggleCancelEvent = { type: 'TOGGLE_CANCEL' };

type UpdateSectionNumberEvent = {
  type: 'UPDATE_SECTION_NUMBER';
  slotAddress: string;
  sectionIndex: number;
  sectionNumber: number;
};

type UpdateAllSourcesEvent = {
  type: 'UPDATE_ALL_SOURCES';
  plannedActions: Map<Address, Array<Source>>;
};

export type CommitConfirmationEvent = {
  type: 'COMMIT_CONFIRMATION';
  confirmOperationLabware: ConfirmOperationLabware;
};

export type SectioningConfirmationCompleteEvent = {
  type: 'SECTIONING_CONFIRMATION_COMPLETE';
};

export type ConfirmLabwareEvent =
  | SetCommentForAddressEvent
  | SetCommentsForSectionEvent
  | SetCommentForAllEvent
  | SetRegionForSectionEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | LayoutMachineDone
  | ToggleCancelEvent
  | UpdateSectionNumberEvent
  | UpdateAllSourcesEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent;

function buildConfirmSection(destinationAddress: string, plannedAction: Source): ConfirmSection {
  return {
    destinationAddress,
    newSection: plannedAction.newSection,
    sampleId: plannedAction.sampleId,
    region: plannedAction.region,
    commentIds: plannedAction.commentIds
  };
}

function buildConfirmSections(destinationAddress: string, plannedActions: Array<Source>): Array<ConfirmSection> {
  return plannedActions.map((action) => buildConfirmSection(destinationAddress, action));
}

/**
 * ConfirmLabware Machine
 */
export const createConfirmLabwareMachine = (
  comments: Array<Comment>,
  labware: NewLabwareLayout,
  layoutPlan: LayoutPlan
) =>
  createMachine<ConfirmLabwareContext, ConfirmLabwareEvent>(
    {
      id: 'sectioningOutcome',
      initial: 'editableMode',
      context: {
        comments,
        labware,
        originalLayoutPlan: cloneDeep(layoutPlan),
        layoutPlan: cloneDeep(layoutPlan),
        addressToCommentMap: new Map(),
        cancelled: false,
        confirmSectionLabware: null,
        commentsForAllSections: []
      },
      on: {
        SECTIONING_CONFIRMATION_COMPLETE: 'done'
      },
      entry: 'commitConfirmation',
      states: {
        editableMode: {
          on: {
            TOGGLE_CANCEL: {
              actions: ['toggleCancel', 'commitConfirmation']
            },
            SET_COMMENT_FOR_ADDRESS: {
              actions: ['assignAddressComment', 'commitConfirmation']
            },
            SET_COMMENTS_FOR_SECTION: {
              actions: ['assignSectionAddressComment', 'commitConfirmation']
            },
            SET_COMMENT_FOR_ALL: {
              actions: ['assignAllComment', 'commitConfirmation']
            },
            EDIT_LAYOUT: {
              target: 'editingLayout'
            },
            UPDATE_SECTION_NUMBER: {
              actions: ['updateSectionNumber', 'commitConfirmation']
            },
            UPDATE_ALL_SOURCES: {
              actions: ['updateAllSources', 'commitConfirmation']
            },
            SET_REGION_FOR_SECTION: {
              actions: ['assignRegionInSection', 'commitConfirmation']
            }
          }
        },
        editingLayout: {
          invoke: {
            src: 'layoutMachine',
            id: 'layoutMachine',
            onDone: {
              target: 'editableMode',
              actions: ['assignLayoutPlan', 'commitConfirmation']
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
        /**
         * Assign a comment to a particular address
         */
        assignAddressComment: assign((ctx, e) => {
          if (e.type !== 'SET_COMMENT_FOR_ADDRESS') {
            return;
          }
          if (e.commentId === '') {
            ctx.addressToCommentMap.delete(e.address);
          } else {
            ctx.addressToCommentMap.set(e.address, Number(e.commentId));
          }
        }),
        assignSectionAddressComment: assign((ctx, e) => {
          if (e.type !== 'SET_COMMENTS_FOR_SECTION') {
            return;
          }
          const plannedAction = ctx.layoutPlan.plannedActions.get(e.address);

          if (plannedAction && plannedAction[e.sectionIndex]) {
            plannedAction[e.sectionIndex].commentIds = e.commentIds.map((commentID) => Number(commentID));
          }
        }),
        /**
         * Assign all the addresses with planned actions in the same comment
         */
        assignAllComment: assign((ctx, e) => {
          if (e.type !== 'SET_COMMENT_FOR_ALL') {
            return;
          }
          if (e.commentIds.length === 0) {
            ctx.addressToCommentMap.clear();
          } else {
            ctx.layoutPlan.plannedActions.forEach((value, key) => {
              ctx.addressToCommentMap.set(key, Number(e.commentIds[0]));
            });
          }
          ctx.commentsForAllSections = e.commentIds;
          ctx.layoutPlan.plannedActions.forEach((action) => {
            action.forEach((action) => {
              action.commentIds = e.commentIds.map((commentID) => Number(commentID));
            });
          });
        }),
        /**
         * Assign all the addresses with planned actions in the same comment
         */
        assignRegionInSection: assign((ctx, e) => {
          if (e.type !== 'SET_REGION_FOR_SECTION') {
            return;
          }
          const plannedAction = ctx.layoutPlan.plannedActions.get(e.address);
          if (plannedAction && plannedAction[e.sectionIndex]) {
            plannedAction[e.sectionIndex].region = e.region;
          }
        }),

        /**
         * Assign the layout plan that comes back from the layout machine.
         * If there are any comments for slots that have now been removed, removed the comment also
         */
        assignLayoutPlan: assign((ctx, e) => {
          if (e.type !== 'done.invoke.layoutMachine' || !e.data) {
            return;
          }
          ctx.layoutPlan = e.data.layoutPlan;

          const unemptyAddresses = new Set(ctx.layoutPlan.plannedActions.keys());
          ctx.addressToCommentMap.forEach((_, key) => {
            if (!unemptyAddresses.has(key)) {
              ctx.addressToCommentMap.delete(key);
            }
          });
        }),

        /**
         * Toggles whether this labware was used or not
         */
        toggleCancel: assign((ctx, e) => {
          if (e.type !== 'TOGGLE_CANCEL') {
            return;
          }
          ctx.cancelled = !ctx.cancelled;
        }),

        updateSectionNumber: assign((ctx, e) => {
          if (e.type !== 'UPDATE_SECTION_NUMBER') {
            return;
          }
          const plannedAction = ctx.layoutPlan.plannedActions.get(e.slotAddress);

          if (plannedAction && plannedAction[e.sectionIndex]) {
            plannedAction[e.sectionIndex].newSection = e.sectionNumber;
          }
        }),

        updateAllSources: assign((ctx, e) => {
          if (e.type !== 'UPDATE_ALL_SOURCES') {
            return;
          }
          /**There is a change in sections (precisely section numbers) from parent , so update the plans in this machine context**/
          //copy the changes to current layout plan as well
          for (let [key, updateSources] of e.plannedActions.entries()) {
            const currentSources = ctx.layoutPlan.plannedActions.get(key);
            updateSources &&
              updateSources.forEach((source, indx) => {
                if (currentSources && currentSources.length > indx) {
                  currentSources[indx] = { ...source };
                }
              });
          }
        }),
        commitConfirmation: assign((ctx) => {
          const confirmSections: Array<ConfirmSection> = [];
          for (let [destinationAddress, originalPlannedActions] of ctx.layoutPlan.plannedActions.entries()) {
            confirmSections.push(...buildConfirmSections(destinationAddress, originalPlannedActions));
          }
          ctx.confirmSectionLabware = {
            barcode: ctx.labware.barcode!,
            cancelled: ctx.cancelled,
            confirmSections: ctx.cancelled ? undefined : confirmSections,
            addressComments: Array.from(ctx.addressToCommentMap.entries()).map(([address, commentId]) => ({
              address,
              commentId
            }))
          };
        })
      },
      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(ctx.layoutPlan, ctx.originalLayoutPlan.plannedActions);
        }
      }
    }
  );
