import { createMachine } from "xstate";
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  PassFail,
} from "../../types/sdk";
import { labwareSamples } from "../../lib/helpers/labwareHelper";
import { assign } from "@xstate/immer";

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

  /**
   * {
   *   "A1": {
   *     sampleId: 1,
   *     result: undefined,
   *     commentId: undefined,
   *   },
   *
   *   "A1": {
   *     sampleId: 1,
   *     result: PassFail.FAIL,
   *     commentId: 3,
   *   }
   * }
   */
  sampleResults: Map<string, SampleResult>;
};

type LabwareResultEvent =
  | { type: "PASS_ALL" }
  | { type: "FAIL_ALL" }
  | { type: "PASS"; address: string }
  | { type: "FAIL"; address: string }
  | { type: "SET_COMMENT"; address: string; commentId: number }
  | { type: "SET_ALL_COMMENTS"; commentId: number };

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
            FAIL: {
              actions: "assignSlotFailed",
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

        assignSlotFailed: assign((ctx, e) => {
          if (e.type !== "FAIL") return;

          ctx.sampleResults.set(e.address, {
            result: PassFail.Fail,
            commentId: undefined,
          });
        }),
      },
    }
  );
}

/**
 * Build the initial sample results for a given labware
 * @param labware a piece of labware
 */
function buildInitialSampleResults(
  labware: LabwareFieldsFragment
): Map<string, SampleResult> {
  const sampleResults: Map<string, SampleResult> = new Map();

  labwareSamples(labware).forEach(({ slot }) => {
    sampleResults.set(slot.address, {
      result: PassFail.Fail,
      commentId: undefined,
    });
  });

  return sampleResults;
}
