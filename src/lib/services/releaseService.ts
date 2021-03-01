import {
  GetReleaseInfoDocument,
  GetReleaseInfoQuery,
  ReleaseLabwareDocument,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
} from "../../types/graphql";
import client from "../client";
import { ReleaseMachine } from "../machines/release/releaseMachineTypes";
import { buildReleaseMachine } from "../factories/machineFactory";

/**
 * Fetch the necessary release info, then build a {@link ReleaseMachine} with it
 */
export async function getReleaseMachine(): Promise<ReleaseMachine> {
  const releaseInfo = await getReleaseInfo();
  return buildReleaseMachine(releaseInfo);
}

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
 * @param variables the mutation variables
 */
export async function releaseLabware(
  variables: ReleaseLabwareMutationVariables
) {
  const response = await client.mutate<
    ReleaseLabwareMutation,
    ReleaseLabwareMutationVariables
  >({
    mutation: ReleaseLabwareDocument,
    variables,
  });

  return response.data;
}
