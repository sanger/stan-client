import { assign, createMachine, fromPromise } from 'xstate';
import {
  UpdateWorkDnapStudyMutation,
  UpdateWorkNumBlocksMutation,
  UpdateWorkNumOriginalSamplesMutation,
  UpdateWorkNumSlidesMutation,
  UpdateWorkOmeroProjectMutation,
  UpdateWorkPriorityMutation,
  UpdateWorkStatusMutation,
  WorkStatus,
  WorkWithCommentFieldsFragment
} from '../../types/sdk';
import { stanCore } from '../../lib/sdk';
import { castDraft, produce } from '../../dependencies/immer';
import { Maybe } from 'yup';
import { ClientError } from 'graphql-request';

type WorkRowMachineContext = {
  /**
   * Work with possible comment
   */
  workWithComment: WorkWithCommentFieldsFragment;

  /**
   * Is the user currently editing the Work status?
   */
  editModeEnabled: boolean;

  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;

  /**
   * success message, if any
   */
  serverSuccess?: Maybe<string>;

  /**
   * A boolean flags indicating the machine event. This is primarily used as a replacement for assertions based on context.event.type,
   * given that the event object has been removed from the context in XState v5.
   * In the current (snapshot, using the new terminology in XState v5), only context parameters are directly accessible.
   */
  isInvokeActorDone?: boolean;
};

export type WorkRowEvent =
  | { type: 'EDIT' }
  | { type: 'PAUSE'; commentId: number }
  | { type: 'COMPLETE'; commentId: number | undefined }
  | { type: 'FAIL'; commentId: number }
  | { type: 'WITHDRAW'; commentId: number }
  | { type: 'REACTIVATE'; commentId: number | undefined }
  | { type: 'ACTIVE'; commentId: undefined }
  | { type: 'UPDATE_NUM_BLOCKS'; numBlocks: number | undefined }
  | { type: 'UPDATE_NUM_SLIDES'; numSlides: number | undefined }
  | {
      type: 'UPDATE_NUM_ORIGINAL_SAMPLES';
      numOriginalSamples: number | undefined;
    }
  | { type: 'UPDATE_PRIORITY'; priority: string | undefined }
  | { type: 'UPDATE_OMERO_PROJECT'; omeroProject: string | undefined }
  | { type: 'UPDATE_DNAP_PROJECT'; ssStudyId: number }
  | { type: 'xstate.done.actor.updateWorkStatus'; output: UpdateWorkStatusMutation }
  | { type: 'xstate.done.actor.updateWorkNumBlocks'; output: UpdateWorkNumBlocksMutation }
  | { type: 'xstate.done.actor.updateWorkNumSlides'; output: UpdateWorkNumSlidesMutation }
  | { type: 'xstate.done.actor.updateWorkPriority'; output: UpdateWorkPriorityMutation }
  | { type: 'xstate.done.actor.updateWorkOmeroProject'; output: UpdateWorkOmeroProjectMutation }
  | { type: 'xstate.done.actor.updateWorkDnapProject'; output: UpdateWorkDnapStudyMutation }
  | { type: 'xstate.error.actor.updateWorkDnapProject'; error: ClientError }
  | { type: 'xstate.done.actor.updateWorkNumOriginalSamples'; output: UpdateWorkNumOriginalSamplesMutation };

type CreateWorkRowMachineParams = Pick<WorkRowMachineContext, 'workWithComment'>;

export default function createWorkRowMachine({ workWithComment }: CreateWorkRowMachineParams) {
  return createMachine(
    {
      id: 'workRowMachine',
      types: {} as {
        context: WorkRowMachineContext;
        events: WorkRowEvent;
      },
      context: {
        workWithComment,
        editModeEnabled: false
      },
      initial: 'deciding',
      states: {
        deciding: {
          always: [
            maybeGoToStatus('unstarted'),
            maybeGoToStatus('active'),
            maybeGoToStatus('paused'),
            maybeGoToStatus('completed'),
            maybeGoToStatus('failed'),
            maybeGoToStatus('withdrawn')
          ]
        },
        unstarted: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            ACTIVE: 'updating',
            UPDATE_NUM_BLOCKS: 'editNumberBlocks',
            UPDATE_NUM_SLIDES: 'editNumberSlides',
            UPDATE_NUM_ORIGINAL_SAMPLES: 'editNumberOriginalSamples',
            UPDATE_PRIORITY: 'editPriority',
            UPDATE_OMERO_PROJECT: 'updateOmeroProject',
            UPDATE_DNAP_PROJECT: 'updateDnapProject'
          }
        },
        active: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            PAUSE: 'updating',
            COMPLETE: 'updating',
            FAIL: 'updating',
            WITHDRAW: 'updating',
            UPDATE_NUM_BLOCKS: 'editNumberBlocks',
            UPDATE_NUM_SLIDES: 'editNumberSlides',
            UPDATE_NUM_ORIGINAL_SAMPLES: 'editNumberOriginalSamples',
            UPDATE_PRIORITY: 'editPriority',
            UPDATE_OMERO_PROJECT: 'updateOmeroProject',
            UPDATE_DNAP_PROJECT: 'updateDnapProject'
          }
        },
        paused: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            REACTIVATE: 'updating',
            COMPLETE: 'updating',
            FAIL: 'updating',
            WITHDRAW: 'updating',
            UPDATE_NUM_BLOCKS: 'editNumberBlocks',
            UPDATE_NUM_SLIDES: 'editNumberSlides',
            UPDATE_NUM_ORIGINAL_SAMPLES: 'editNumberOriginalSamples',
            UPDATE_PRIORITY: 'editPriority',
            UPDATE_OMERO_PROJECT: 'updateOmeroProject',
            UPDATE_DNAP_PROJECT: 'updateDnapProject'
          }
        },
        completed: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            REACTIVATE: 'updating'
          }
        },
        failed: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            REACTIVATE: 'updating'
          }
        },
        withdrawn: {
          on: {
            EDIT: { actions: 'toggleEditMode' },
            REACTIVATE: 'updating'
          }
        },
        updating: {
          invoke: {
            src: fromPromise(({ input }) =>
              stanCore.UpdateWorkStatus({
                ...input
              })
            ),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              status: getWorkStatusFromEventType(event),
              commentId: 'commentId' in event ? event.commentId : undefined
            }),
            id: 'updateWorkStatus',
            onDone: {
              actions: ['assignSgpNumber', 'toggleEditMode'],
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        editNumberBlocks: {
          invoke: {
            src: fromPromise(({ input }) => {
              return stanCore.UpdateWorkNumBlocks(input);
            }),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              numBlocks: 'numBlocks' in event && event.numBlocks ? event.numBlocks : undefined
            }),
            id: 'updateWorkNumBlocks',
            onDone: {
              actions: 'assignWorkNumBlocks',
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        editNumberSlides: {
          invoke: {
            src: fromPromise(({ input }) => stanCore.UpdateWorkNumSlides(input)),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              numSlides: 'numSlides' in event && event.numSlides ? event.numSlides : undefined
            }),
            id: 'updateWorkNumSlides',
            onDone: {
              actions: 'assignWorkNumSlides',
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        editNumberOriginalSamples: {
          invoke: {
            src: fromPromise(({ input }) => stanCore.UpdateWorkNumOriginalSamples(input)),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              numOriginalSamples:
                'numOriginalSamples' in event && event.numOriginalSamples ? event.numOriginalSamples : undefined
            }),
            onDone: {
              actions: 'assignWorkNumOriginalSamples',
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        editPriority: {
          invoke: {
            src: fromPromise(({ input }) => stanCore.UpdateWorkPriority(input)),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              priority: 'priority' in event && event.priority ? event.priority : undefined
            }),
            id: 'updateWorkPriority',
            onDone: {
              actions: 'assignWorkPriority',
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        updateOmeroProject: {
          invoke: {
            src: fromPromise(({ input }) => stanCore.UpdateWorkOmeroProject(input)),
            input: ({ context, event }) => ({
              workNumber: context.workWithComment.work.workNumber,
              omeroProject: 'omeroProject' in event && event.omeroProject ? event.omeroProject : undefined
            }),
            id: 'updateWorkOmeroProject',
            onDone: {
              actions: 'assignWorkOmeroProject',
              target: 'deciding'
            },
            onError: { target: 'deciding' }
          }
        },
        updateDnapProject: {
          invoke: {
            src: fromPromise(({ input }) => {
              if (input) return stanCore.UpdateWorkDnapStudy(input);
              return Promise.reject();
            }),
            input: ({ context, event }) => {
              if ('ssStudyId' in event) {
                return {
                  workNumber: context.workWithComment.work.workNumber,
                  ssStudyId: event.ssStudyId
                };
              }
              return undefined;
            },
            id: 'updateWorkDnapProject',
            onDone: {
              actions: 'assignWorkDnapProject',
              target: 'deciding'
            },
            onError: {
              target: 'deciding',
              actions: 'assignServerError'
            }
          }
        }
      }
    },
    {
      actions: {
        assignSgpNumber: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkStatus') return context;
          return { ...context, workWithComment: event.output.updateWorkStatus, isInvokeActorDone: true };
        }),
        assignWorkNumBlocks: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkNumBlocks') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkNumBlocks;
            draft.isInvokeActorDone = true;
          });
        }),
        assignWorkNumSlides: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkNumSlides') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkNumSlides;
            draft.isInvokeActorDone = true;
          });
        }),
        assignWorkNumOriginalSamples: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkNumOriginalSamples') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkNumOriginalSamples;
          });
        }),
        assignWorkPriority: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkPriority') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkPriority;
            draft.isInvokeActorDone = true;
          });
        }),
        assignWorkOmeroProject: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkOmeroProject') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkOmeroProject;
            draft.isInvokeActorDone = true;
          });
        }),
        assignWorkDnapProject: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateWorkDnapProject') return context;
          return produce(context, (draft) => {
            draft.workWithComment.work = event.output.updateWorkDnapStudy;
            draft.serverSuccess =
              'DNAP project successfully updated to ' + event.output.updateWorkDnapStudy.dnapStudy!.name;
            draft.isInvokeActorDone = true;
          });
        }),
        toggleEditMode: assign(({ context, event }) => {
          return { ...context, editModeEnabled: !context.editModeEnabled };
        }),
        assignServerError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.updateWorkDnapProject') return context;
          return { ...context, serverErrors: castDraft(event.error) };
        })
      }
    }
  );
}

/**
 * Determine the next {@link WorkStatus} from a given event
 * @param e a {@link WorkRowEvent}
 */
function getWorkStatusFromEventType(e: WorkRowEvent): WorkStatus {
  switch (e.type) {
    case 'COMPLETE':
      return WorkStatus.Completed;
    case 'FAIL':
      return WorkStatus.Failed;
    case 'WITHDRAW':
      return WorkStatus.Withdrawn;
    case 'PAUSE':
      return WorkStatus.Paused;
    case 'REACTIVATE':
      return WorkStatus.Active;
    case 'ACTIVE':
      return WorkStatus.Active;
  }

  throw new Error(`Can not determine next WorkStatus from event ${e.type}`);
}

/**
 * Action creator for determining which state to go to next, based on some Work's status
 * @param status the status to check
 */
function maybeGoToStatus(status: string) {
  return {
    target: status,
    guard: ({ context }: { context: WorkRowMachineContext }) =>
      context.workWithComment.work.status.toLowerCase() === status.toLowerCase()
  };
}
