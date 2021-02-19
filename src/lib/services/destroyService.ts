import { DestroyMachine } from "../machines/destroy/destroyMachineTypes";
import { buildDestroyMachine } from "../factories/machineFactory";
import client from "../client";
import {
  DestroyDocument,
  DestroyMutation,
  DestroyMutationVariables,
  DestroyRequest,
  GetDestroyInfoDocument,
  GetDestroyInfoQuery,
  GetDestroyInfoQueryVariables,
} from "../../types/graphql";

/**
 * Fetch the necessary data for the destroy and return a {@link DestroyMachine}
 */
export async function getDestroyMachine(): Promise<DestroyMachine> {
  const response = await client.query<
    GetDestroyInfoQuery,
    GetDestroyInfoQueryVariables
  >({
    query: GetDestroyInfoDocument,
  });
  return Promise.resolve(buildDestroyMachine(response.data));
}

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
