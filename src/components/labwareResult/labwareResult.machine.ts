import { assign, createMachine } from 'xstate';
import {
  CommentFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  SampleIdCommentId,
  SlotFieldsFragment
} from '../../types/sdk';
import { produce } from '../../dependencies/immer';

export type LabwareResultContext = {
  /**
   * The initial LabwareResult
   */
  labwareResult: CoreLabwareResult;

  /**
   * List of comments to display on failed samples
   */
  availableComments: Array<CommentFieldsFragment>;
};

type LabwareResultEvent =
  | { type: 'PASS_ALL' }
  | { type: 'FAIL_ALL' }
  | { type: 'PASS'; address: string }
  | { type: 'FAIL'; address: string }
  | { type: 'SET_COMMENT'; address: string; commentId: number | undefined }
  | { type: 'SET_SAMPLE_COMMENTS'; address: string; sampleId: number; commentIds: number[] | undefined }
  | { type: 'SET_ALL_COMMENTS'; commentId: number[] | number | undefined; slots?: SlotFieldsFragment[] }
  | { type: 'SET_TISSUE_COVERAGE'; address: string; value: string };

export default function createLabwareResultMachine() {
  return createMachine(
    {
      id: 'labwareResultMachine',
      types: {} as {
        context: LabwareResultContext;
        events: LabwareResultEvent;
      },
      initial: 'ready',
      context: ({ input }: { input: LabwareResultContext }) => ({ ...input }),
      states: {
        ready: {
          on: {
            PASS_ALL: {
              actions: 'assignAllPassed'
            },
            FAIL_ALL: {
              actions: 'assignAllFailed'
            },
            FAIL: {
              actions: 'assignSlotFailed'
            },
            PASS: {
              actions: 'assignSlotPassed'
            },
            SET_COMMENT: {
              actions: 'assignSlotComment'
            },
            SET_SAMPLE_COMMENTS: {
              actions: 'assignSampleComments'
            },
            SET_ALL_COMMENTS: {
              actions: 'assignAllComments'
            },
            SET_TISSUE_COVERAGE: {
              actions: 'assignTissueCoverage'
            }
          }
        }
      }
    },
    {
      actions: {
        assignAllPassed: assign(({ context, event }) => {
          if (event.type !== 'PASS_ALL') return context;

          return produce(context, (draft) => {
            draft.labwareResult.sampleResults?.forEach((sr) => {
              sr.result = PassFail.Pass;
            });
          });
        }),

        assignAllFailed: assign(({ context, event }) => {
          if (event.type !== 'FAIL_ALL') return context;
          return produce(context, (draft) => {
            draft.labwareResult.sampleResults?.forEach((sr) => {
              sr.result = PassFail.Fail;
            });
          });
        }),

        assignSlotPassed: assign(({ context, event }) => {
          if (event.type !== 'PASS') return context;

          return produce(context, (draft) => {
            const sampleResult = draft.labwareResult.sampleResults?.find((sr) => sr.address === event.address);

            if (sampleResult) {
              sampleResult.result = PassFail.Pass;
            }
          });
        }),

        assignSlotFailed: assign(({ context, event }) => {
          if (event.type !== 'FAIL') return context;

          return produce(context, (draft) => {
            const sampleResult = draft.labwareResult.sampleResults?.find((sr) => sr.address === event.address);

            if (sampleResult) {
              sampleResult.result = PassFail.Fail;
            }
          });
        }),

        assignSlotComment: assign(({ context, event }) => {
          if (event.type !== 'SET_COMMENT') return context;

          return produce(context, (draft) => {
            const sampleResult = draft.labwareResult.sampleResults?.find((sr) => sr.address === event.address);
            if (!sampleResult?.result) {
              return context;
            }
            sampleResult.commentId = event.commentId;
          });
        }),
        assignSampleComments: assign(({ context, event }) => {
          if (event.type !== 'SET_SAMPLE_COMMENTS') return context;
          return produce(context, (draft) => {
            /**Find result belong to this address**/
            const sampleResult = draft.labwareResult.sampleResults?.find((sr) => sr.address === event.address);
            if (!sampleResult?.result) {
              return context;
            }
            /**Remove all existing sample comments belong to the given sample id
             * (Multiple comments can be selected against each sample)
             ***/
            const sampleComments = sampleResult?.sampleComments
              ? sampleResult?.sampleComments.filter((sc) => sc.sampleId !== event.sampleId)
              : [];
            /**Save all given comments for the given sample.
             * Each comment for a sample is saved as a {@link SampleIdCommentId} object
             ***/
            if (event.commentIds) {
              event.commentIds.forEach((commentId) => {
                sampleComments.push({
                  sampleId: event.sampleId,
                  commentId
                });
              });
            }
            sampleResult.sampleComments = sampleComments;
          });
        }),

        assignAllComments: assign(({ context, event }) => {
          if (event.type !== 'SET_ALL_COMMENTS') return context;

          /**This can be called with multiple comments,single comments for slots with single sections nad multiple sections.
           * To allow storing multiple comments against a slot , or to store single/multiple comments in multiple
           * sectios in a slot, 'slots' param should be provided to this action
           *
           *sr.result.commentId is used in places where only one comment is assigned and mostly one section per slot (backward compatibility)
           *sr.result.sampleComments is supported in places where there are multiple comments and multiple sections in a slot**/
          return produce(context, (draft) => {
            draft.labwareResult.sampleResults?.forEach((sr) => {
              if (sr.result) {
                const sampleComments: SampleIdCommentId[] = [];
                /**No comments given, so reset all comments**/
                if (!event.commentId) {
                  sr.sampleComments = [];
                  sr.commentId = undefined;
                  return;
                }
                /**Slots given**/
                if (event.slots) {
                  const slotsForAddress = event.slots.find((slot) => slot.address === sr.address);
                  if (slotsForAddress) {
                    /**Multiple comments supported,so store each of them as a separate sampleComment object**/
                    if (Array.isArray(event.commentId)) {
                      event.commentId.forEach((commentId) => {
                        slotsForAddress.samples.forEach((sample) => {
                          sampleComments.push({ sampleId: sample.id, commentId });
                        });
                      });
                      sr.sampleComments = sampleComments;
                    } else {
                      /**Only one comment supported**/
                      /**One comment, but multiple sections in slot, so assign single comment to each section
                       * and store as a sampleComment object **/
                      if (slotsForAddress.samples.length > 1) {
                        slotsForAddress.samples.forEach((sample) => {
                          sampleComments.push({ sampleId: sample.id, commentId: event.commentId as number });
                        });
                        sr.sampleComments = sampleComments;
                      } else {
                        /**One comment and one section per slot**/
                        sr.commentId = event.commentId as number;
                      }
                    }
                  }
                } else {
                  /**No slot information given, so store a single comment (even if multiple comments are given) in commentId**/
                  sr.commentId = event.commentId
                    ? Array.isArray(event.commentId)
                      ? event.commentId.length > 0
                        ? event.commentId[0]
                        : undefined
                      : (event.commentId as number)
                    : undefined;
                }
              }
            });
          });
        }),

        assignTissueCoverage: assign(({ context, event }) => {
          if (event.type !== 'SET_TISSUE_COVERAGE') return context;
          return produce(context, (draft) => {
            const slotMeasurement = draft.labwareResult.slotMeasurements?.find((sr) => sr.address === event.address);
            if (!slotMeasurement) {
              return context;
            }
            slotMeasurement.value = event.value;
          });
        })
      }
    }
  );
}
