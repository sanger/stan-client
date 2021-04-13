import client from "../client";
import {
  DestroyDocument,
  DestroyMutation,
  DestroyMutationVariables,
  DestroyRequest,
} from "../../types/graphql";

/**
 * Send a request to core to destroy some labware
 * @param request the destroy request
 */
export async function destroy(request: DestroyRequest) {
  const { data } = await client.mutate<
    DestroyMutation,
    DestroyMutationVariables
  >({
    mutation: DestroyDocument,
    variables: { request },
  });
  return data;
}
