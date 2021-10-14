import { createMachine } from "xstate";
import {
  CommentFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
} from "../../types/sdk";
import { assign } from "@xstate/immer";

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
  | { type: "PASS_ALL" }
  | { type: "FAIL_ALL" }
  | { type: "PASS"; address: string }
  | { type: "FAIL"; address: string }
  | { type: "SET_COMMENT"; address: string; commentId: number | undefined }
  | { type: "SET_ALL_COMMENTS"; commentId: number | undefined };

export default function createLabwareResultMachine({
  availableComments,
  labwareResult,
}: LabwareResultContext) {
  return createMachine<LabwareResultContext, LabwareResultEvent>(
    {
      id: "labwareResultMachine",
      initial: "ready",
      context: {
        availableComments,
        labwareResult,
      },
      states: {
        ready: {
          on: {
            PASS_ALL: {
              actions: "assignAllPassed",
            },
            FAIL_ALL: {
              actions: "assignAllFailed",
            },
            FAIL: {
              actions: "assignSlotFailed",
            },
            PASS: {
              actions: "assignSlotPassed",
            },
            SET_COMMENT: {
              actions: "assignSlotComment",
            },
            SET_ALL_COMMENTS: {
              actions: "assignAllComments",
            },
          },
        },
      },
    },
    {
      actions: {
        assignAllPassed: assign((ctx, e) => {
          if (e.type !== "PASS_ALL") return;

          ctx.labwareResult.sampleResults.forEach((sr) => {
            sr.result = PassFail.Pass;
            sr.commentId = undefined;
          });
        }),

        assignAllFailed: assign((ctx, e) => {
          if (e.type !== "FAIL_ALL") return;
          ctx.labwareResult.sampleResults.forEach((sr) => {
            sr.result = PassFail.Fail;
            sr.commentId = undefined;
          });
        }),

        assignSlotPassed: assign((ctx, e) => {
          if (e.type !== "PASS") return;

          const sampleResult = ctx.labwareResult.sampleResults.find(
            (sr) => sr.address === e.address
          );

          if (sampleResult) {
            sampleResult.result = PassFail.Pass;
            sampleResult.commentId = undefined;
          }
        }),

        assignSlotFailed: assign((ctx, e) => {
          if (e.type !== "FAIL") return;

          const sampleResult = ctx.labwareResult.sampleResults.find(
            (sr) => sr.address === e.address
          );

          if (sampleResult) {
            sampleResult.result = PassFail.Fail;
            sampleResult.commentId = undefined;
          }
        }),

        assignSlotComment: assign((ctx, e) => {
          if (e.type !== "SET_COMMENT") return;

          const sampleResult = ctx.labwareResult.sampleResults.find(
            (sr) => sr.address === e.address
          );

          if (sampleResult?.result !== PassFail.Fail) {
            return;
          }

          sampleResult.commentId = e.commentId;
        }),

        assignAllComments: assign((ctx, e) => {
          if (e.type !== "SET_ALL_COMMENTS") return;

          ctx.labwareResult.sampleResults.forEach((sr) => {
            if (sr.result === PassFail.Fail) {
              sr.commentId = e.commentId;
            }
          });
        }),
      },
    }
  );
}
