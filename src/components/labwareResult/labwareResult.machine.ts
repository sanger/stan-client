import { createMachine } from 'xstate';
import {
  CommentFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  SampleIdCommentId,
  SlotFieldsFragment
} from '../../types/sdk';
import { assign } from '@xstate/immer';

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

export default function createLabwareResultMachine({ availableComments, labwareResult }: LabwareResultContext) {
  return createMachine<LabwareResultContext, LabwareResultEvent>(
    {
      id: 'labwareResultMachine',
      initial: 'ready',
      context: {
        availableComments,
        labwareResult
      },
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
        assignAllPassed: assign((ctx, e) => {
          if (e.type !== 'PASS_ALL') return;

          ctx.labwareResult.sampleResults.forEach((sr) => {
            sr.result = PassFail.Pass;
          });
        }),

        assignAllFailed: assign((ctx, e) => {
          if (e.type !== 'FAIL_ALL') return;
          ctx.labwareResult.sampleResults.forEach((sr) => {
            sr.result = PassFail.Fail;
          });
        }),

        assignSlotPassed: assign((ctx, e) => {
          if (e.type !== 'PASS') return;

          const sampleResult = ctx.labwareResult.sampleResults.find((sr) => sr.address === e.address);

          if (sampleResult) {
            sampleResult.result = PassFail.Pass;
          }
        }),

        assignSlotFailed: assign((ctx, e) => {
          if (e.type !== 'FAIL') return;

          const sampleResult = ctx.labwareResult.sampleResults.find((sr) => sr.address === e.address);

          if (sampleResult) {
            sampleResult.result = PassFail.Fail;
          }
        }),

        assignSlotComment: assign((ctx, e) => {
          if (e.type !== 'SET_COMMENT') return;

          const sampleResult = ctx.labwareResult.sampleResults.find((sr) => sr.address === e.address);
          if (!sampleResult?.result) {
            return;
          }
          sampleResult.commentId = e.commentId;
        }),
        assignSampleComments: assign((ctx, e) => {
          if (e.type !== 'SET_SAMPLE_COMMENTS') return;
          /**Find result belong to this address**/
          const sampleResult = ctx.labwareResult.sampleResults.find((sr) => sr.address === e.address);
          if (!sampleResult?.result) {
            return;
          }
          /**Remove all existing sample comments belong to the given sample id
           * (Multiple comments can be selected against each sample)
           ***/
          const sampleComments = sampleResult?.sampleComments
            ? sampleResult?.sampleComments.filter((sc) => sc.sampleId !== e.sampleId)
            : [];
          /**Save all given comments for the given sample.
           * Each comment for a sample is saved as a {@link SampleIdCommentId} object
           ***/
          if (e.commentIds) {
            e.commentIds.forEach((commentId) => {
              sampleComments.push({
                sampleId: e.sampleId,
                commentId
              });
            });
          }
          sampleResult.sampleComments = sampleComments;
        }),

        assignAllComments: assign((ctx, e) => {
          if (e.type !== 'SET_ALL_COMMENTS') return;

          /**This can be called with multiple comments,single comments for slots with single sections nad multiple sections.
           * To allow storing multiple comments against a slot , or to store single/multiple comments in multiple
           * sectios in a slot, 'slots' param should be provided to this action
           *
           *sr.result.commentId is used in places where only one comment is assigned and mostly one section per slot (backward compatibility)
           *sr.result.sampleComments is supported in places where there are multiple comments and multiple sections in a slot**/
          ctx.labwareResult.sampleResults.forEach((sr) => {
            if (sr.result) {
              const sampleComments: SampleIdCommentId[] = [];
              /**No comments given, so reset all comments**/
              if (!e.commentId) {
                sr.sampleComments = [];
                sr.commentId = undefined;
                return;
              }
              /**Slots given**/
              if (e.slots) {
                const slotsForAddress = e.slots.find((slot) => slot.address === sr.address);
                if (slotsForAddress) {
                  /**Multiple comments supported,so store each of them as a separate sampleComment object**/
                  if (Array.isArray(e.commentId)) {
                    e.commentId.forEach((commentId) => {
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
                        sampleComments.push({ sampleId: sample.id, commentId: e.commentId as number });
                      });
                    } else {
                      /**One comment and one section per slot**/
                      sr.commentId = e.commentId as number;
                    }
                  }
                }
              } else {
                /**No slot information given, so store a single comment (even if multiple comments are given) in commentId**/
                sr.commentId = e.commentId
                  ? Array.isArray(e.commentId)
                    ? e.commentId.length > 0
                      ? e.commentId[0]
                      : undefined
                    : (e.commentId as number)
                  : undefined;
              }
            }
          });
        }),

        assignTissueCoverage: assign((ctx, e) => {
          if (e.type !== 'SET_TISSUE_COVERAGE') return;
          const slotMeasurement = ctx.labwareResult.slotMeasurements?.find((sr) => sr.address === e.address);
          if (!slotMeasurement) {
            return;
          }
          slotMeasurement.value = e.value;
        })
      }
    }
  );
}
