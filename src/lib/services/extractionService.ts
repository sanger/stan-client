import { ExtractionMachine } from "../machines/extraction/extractionMachineTypes";
import { buildExtractionMachine } from "../factories/machineFactory";
import {
  ExtractDocument,
  ExtractMutation,
  ExtractMutationVariables,
  ExtractRequest,
} from "../../types/graphql";
import client from "../client";

export async function getExtractionMachine(): Promise<ExtractionMachine> {
  return Promise.resolve(buildExtractionMachine());
}

/**
 * Send an extract mutation to core
 */
export async function extract(request: ExtractRequest) {
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
