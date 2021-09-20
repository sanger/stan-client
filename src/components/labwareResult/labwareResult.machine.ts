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
  result: PassFail | undefined;
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

type LabwareResultEvent = { type: "PASS_ALL" } | { type: "FAIL_ALL" };

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

  labwareSamples(labware).forEach(({ sample, slot }) => {
    sampleResults.set(slot.address, {
      result: undefined,
      commentId: undefined,
    });
  });

  return sampleResults;
}
