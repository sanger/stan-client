import { ActorRef, assign, createMachine } from 'xstate';
import { Comment, ConfirmOperationLabware, ConfirmSection, ConfirmSectionLabware, Maybe } from '../../types/sdk';
import { LayoutPlan, Source } from '../../lib/machines/layout/layoutContext';
import { cloneDeep } from 'lodash';
import { Address, NewFlaggedLabwareLayout } from '../../types/stan';
import { createLayoutMachine } from '../../lib/machines/layout/layoutMachine';
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
   * Map of labware address to comment ID
   */
  addressToCommentMap: Map<Address, number>;

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
type DoneEditLayoutEvent = { type: 'DONE_EDIT_LAYOUT' };

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

type AssignLayoutPlanEvent = {
  type: 'ASSIGN_LAYOUT_PLAN';
  layoutPlan: LayoutPlan;
};

type CancelEditLayoutEvent = {
  type: 'CANCEL_EDIT_LAYOUT';
};

type AssignSectionWorkNumber = {
  type: 'UPDATE_SECTION_WORK_NUMBER';
  labware: ConfirmSectionLabware;
  workNumber: string;
};

type UpdateSectionThicknessEvent = {
  type: 'UPDATE_SECTION_THICKNESS';
  slotAddress: string;
  thickness: string;
  sectionIndex: number;
};

export type ConfirmLabwareEvent =
  | SetCommentForAddressEvent
  | SetCommentsForSectionEvent
  | SetCommentForAllEvent
  | SetRegionForSectionEvent
  | EditLayoutEvent
  | DoneEditLayoutEvent
  | ToggleCancelEvent
  | UpdateSectionNumberEvent
  | UpdateAllSourcesEvent
  | CommitConfirmationEvent
  | SectioningConfirmationCompleteEvent
  | AssignLayoutPlanEvent
  | CancelEditLayoutEvent
  | AssignSectionWorkNumber
  | UpdateSectionThicknessEvent;

function buildConfirmSection(destinationAddress: string, plannedAction: Source): ConfirmSection {
  return {
    destinationAddress,
    newSection: plannedAction.newSection,
    thickness: plannedAction.sampleThickness,
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
        addressToCommentMap: new Map(),
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
            UPDATE_SECTION_THICKNESS: {
              actions: ['updateSectionThickness', 'commitConfirmation']
            },
            UPDATE_ALL_SOURCES: {
              actions: ['updateAllSources', 'commitConfirmation']
            },
            SET_REGION_FOR_SECTION: {
              actions: ['assignRegionInSection', 'commitConfirmation']
            },
            UPDATE_SECTION_WORK_NUMBER: {
              actions: 'assignSectionWorkNumber'
            }
          }
        },
        editingLayout: {
          id: 'layoutMachine',
          entry: [
            assign({
              layoutMachine: ({ spawn, context }) =>
                spawn(createLayoutMachine(context.layoutPlan, context.originalLayoutPlan.plannedActions))
            })
          ],
          on: {
            ASSIGN_LAYOUT_PLAN: {
              actions: ['assignLayoutPlan', 'commitConfirmation'],
              target: 'editableMode'
            },
            CANCEL_EDIT_LAYOUT: {
              actions: 'cancelEditLayout',
              target: 'editableMode'
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
        /**
         * Assign a comment to a particular address
         */
        assignAddressComment: assign(({ context, event }) => {
          if (event.type !== 'SET_COMMENT_FOR_ADDRESS') {
            return context;
          }
          return produce(context, (draft) => {
            if (event.commentId === '') {
              draft.addressToCommentMap.delete(event.address);
            } else {
              draft.addressToCommentMap.set(event.address, Number(event.commentId));
            }
          });
        }),
        assignSectionAddressComment: assign(({ context, event }) => {
          if (event.type !== 'SET_COMMENTS_FOR_SECTION') {
            return context;
          }
          return produce(context, (draft) => {
            const plannedAction = draft.layoutPlan.plannedActions.get(event.address);

            if (plannedAction && plannedAction[event.sectionIndex]) {
              plannedAction[event.sectionIndex].commentIds = event.commentIds.map((commentID) => Number(commentID));
            }
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
            if (event.commentIds.length === 0) {
              draft.addressToCommentMap.clear();
            } else {
              draft.layoutPlan.plannedActions.forEach((value, key) => {
                draft.addressToCommentMap.set(key, Number(event.commentIds[0]));
              });
            }
            draft.commentsForAllSections = event.commentIds;
            draft.layoutPlan.plannedActions.forEach((action) => {
              action.forEach((action) => {
                action.commentIds = event.commentIds.map((commentID) => Number(commentID));
              });
            });
          });
        }),
        /**
         * Assign all the addresses with planned actions in the same comment
         */
        assignRegionInSection: assign(({ context, event }) => {
          if (event.type !== 'SET_REGION_FOR_SECTION') {
            return context;
          }
          return produce(context, (draft) => {
            const plannedAction = draft.layoutPlan.plannedActions.get(event.address);
            if (plannedAction && plannedAction[event.sectionIndex]) {
              plannedAction[event.sectionIndex].region = event.region;
            }
          });
        }),

        /**
         * Assign the layout plan that comes back from the layout machine.
         * If there are any comments for slots that have now been removed, removed the comment also
         */
        assignLayoutPlan: assign(({ context, event }) => {
          if (event.type !== 'ASSIGN_LAYOUT_PLAN' || !event.layoutPlan) {
            return context;
          }
          return produce(context, (draft) => {
            draft.layoutPlan = event.layoutPlan;

            const unemptyAddresses = new Set(draft.layoutPlan.plannedActions.keys());
            draft.addressToCommentMap.forEach((_, key) => {
              if (!unemptyAddresses.has(key)) {
                draft.addressToCommentMap.delete(key);
              }
            });
            draft.isLayoutUpdated = true;
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
            const plannedAction = draft.layoutPlan.plannedActions.get(event.slotAddress);

            if (plannedAction && plannedAction[event.sectionIndex]) {
              plannedAction[event.sectionIndex].newSection = event.sectionNumber;
            }
          });
        }),
        updateSectionThickness: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_SECTION_THICKNESS') {
            return context;
          }
          return produce(context, (draft) => {
            const plannedAction = draft.layoutPlan.plannedActions.get(event.slotAddress);
            if (plannedAction && plannedAction[event.sectionIndex]) {
              plannedAction[event.sectionIndex].sampleThickness = event.thickness;
            }
          });
        }),

        updateAllSources: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_ALL_SOURCES') {
            return context;
          }
          /**There is a change in sections (precisely section numbers) from parent , so update the plans in this machine context**/
          return produce(context, (draft) => {
            //copy the changes to current layout plan as well
            for (let [key, updateSources] of event.plannedActions.entries()) {
              const currentSources = draft.layoutPlan.plannedActions.get(key);
              updateSources &&
                updateSources.forEach((source, indx) => {
                  if (currentSources && currentSources.length > indx) {
                    currentSources[indx] = { ...currentSources[indx], ...source };
                  }
                });
            }
          });
        }),
        commitConfirmation: assign(({ context }) => {
          const confirmSections: Array<ConfirmSection> = [];
          for (let [destinationAddress, originalPlannedActions] of context.layoutPlan.plannedActions.entries()) {
            confirmSections.push(...buildConfirmSections(destinationAddress, originalPlannedActions));
          }
          const confirmSectionLabware = {
            workNumber: context.confirmSectionLabware?.workNumber || workNumber,
            barcode: context.labware.barcode!,
            cancelled: context.cancelled,
            confirmSections: context.cancelled ? undefined : confirmSections,
            addressComments: Array.from(context.addressToCommentMap.entries()).map(([address, commentId]) => ({
              address,
              commentId
            }))
          };
          return { ...context, workNumber, confirmSectionLabware };
        }),
        cancelEditLayout: assign(({ context, event }) => {
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
