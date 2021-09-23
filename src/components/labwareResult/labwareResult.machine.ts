import { createMachine } from "xstate";
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  PassFail,
} from "../../types/sdk";
import { assign } from "@xstate/immer";
import { isSlotFilled } from "../../lib/helpers/slotHelper";

export type LabwareResultProps = {
  /**
   * Labware to provide a result for
   */
  labware: LabwareFieldsFragment;

  /**
   * List of comments to display on failed samples
   */
  availableComments: Array<CommentFieldsFragment>;
};

type SampleResult = {
  result: PassFail;
  commentId: number | undefined;
};

type LabwareResultContext = {
  availableComments: Array<CommentFieldsFragment>;
  sampleResults: Map<string, SampleResult>;
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
  labware,
}: LabwareResultProps) {
  return createMachine<LabwareResultContext, LabwareResultEvent>(
    {
      id: "labwareResultMachine",
      initial: "ready",
      context: {
        availableComments,
        sampleResults: buildInitialSampleResults(labware),
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

          for (let address of ctx.sampleResults.keys()) {
            ctx.sampleResults.set(address, {
              result: PassFail.Pass,
              commentId: undefined,
            });
          }
        }),

        assignAllFailed: assign((ctx, e) => {
          if (e.type !== "FAIL_ALL") return;
          for (let address of ctx.sampleResults.keys()) {
            ctx.sampleResults.set(address, {
              result: PassFail.Fail,
              commentId: undefined,
            });
          }
        }),

        assignSlotPassed: assign((ctx, e) => {
          if (e.type !== "PASS") return;
          ctx.sampleResults.set(e.address, {
            result: PassFail.Pass,
            commentId: undefined,
          });
        }),

        assignSlotFailed: assign((ctx, e) => {
          if (e.type !== "FAIL") return;

          ctx.sampleResults.set(e.address, {
            result: PassFail.Fail,
            commentId: undefined,
          });
        }),

        assignSlotComment: assign((ctx, e) => {
          if (e.type !== "SET_COMMENT") return;
          if (ctx.sampleResults.get(e.address)!.result !== PassFail.Fail)
            return;
          ctx.sampleResults.set(e.address, {
            result: PassFail.Fail,
            commentId: e.commentId,
          });
        }),

        assignAllComments: assign((ctx, e) => {
          if (e.type !== "SET_ALL_COMMENTS") return;
          for (let address of ctx.sampleResults.keys()) {
            if (ctx.sampleResults.get(address)!.result === PassFail.Fail)
              ctx.sampleResults.get(address)!.commentId = e.commentId;
          }
        }),
      },
    }
  );
}

/**
 * Build the initial sample results for a given labware's filled slots.
 * All slots will default to passed.
 * @param labware a piece of labware
 */
function buildInitialSampleResults(
  labware: LabwareFieldsFragment
): Map<string, SampleResult> {
  const sampleResults: Map<string, SampleResult> = new Map();

  labware.slots.filter(isSlotFilled).forEach((slot) => {
    sampleResults.set(slot.address, {
      result: PassFail.Pass,
      commentId: undefined,
    });
  });

  return sampleResults;
}
