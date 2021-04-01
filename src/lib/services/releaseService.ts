import {
  GetReleaseInfoDocument,
  GetReleaseInfoQuery,
  ReleaseLabwareDocument,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
  ReleaseRequest,
} from "../../types/graphql";
import client from "../client";

/**
 * Fetch information necessary for the Release page
 */
export async function getReleaseInfo(): Promise<GetReleaseInfoQuery> {
  const response = await client.query<GetReleaseInfoQuery>({
    query: GetReleaseInfoDocument,
  });
  return response.data;
}

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
