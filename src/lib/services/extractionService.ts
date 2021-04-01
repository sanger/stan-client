import {
  ExtractDocument,
  ExtractMutation,
  ExtractMutationVariables,
  ExtractRequest,
} from "../../types/graphql";
import client from "../client";

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
