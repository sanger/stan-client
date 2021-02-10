import {
  ExtractionContext,
  ExtractionMachine,
} from "../machines/extraction/extractionMachineTypes";
import { buildExtractionMachine } from "../factories/machineFactory";
import {
  ExtractDocument,
  ExtractMutation,
  ExtractMutationVariables,
  PlanRequest,
  PlanRequestLabware,
} from "../../types/graphql";
import client from "../client";

export async function getExtractionMachine(): Promise<ExtractionMachine> {
  return Promise.resolve(buildExtractionMachine());
}

/**
 * Send an extract mutation to core
 */
export async function extract(request: PlanRequest) {
  const response = await client.mutate<
    ExtractMutation,
    ExtractMutationVariables
  >({
    mutation: ExtractDocument,
    variables: {
      request,
    },
  });

  return response.data;
}

/**
 * Build a list of {@link PlanRequestLabware PlanRequestLabwares} from the {@link ExtractionContext}
 * @param ctx the extraction context
 */
export function getPlanRequestLabwares(ctx: ExtractionContext) {
  return ctx.labwares.reduce<PlanRequestLabware[]>((memo, labware) => {
    const planRequestLabware: PlanRequestLabware = {
      labwareType: "Tube",
      actions: [
        {
          source: {
            barcode: labware.barcode,
            address: labware.slots[0].address,
          },
          sampleId: labware.slots[0].samples[0].id,
          address: "A1",
        },
      ],
    };

    memo.push(planRequestLabware);
    return memo;
  }, []);
}
