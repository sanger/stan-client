import {
  ReleaseLabwareDocument,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
  ReleaseRequest,
} from "../../types/graphql";
import client from "../client";

/**
 * Make call to core to release labware
 */
export async function releaseLabware(releaseRequest: ReleaseRequest) {
  const response = await client.mutate<
    ReleaseLabwareMutation,
    ReleaseLabwareMutationVariables
  >({
    mutation: ReleaseLabwareDocument,
    variables: { releaseRequest },
  });

  return response.data;
}
