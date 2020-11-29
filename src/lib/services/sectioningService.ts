import client from "../client";
import {
  GetSectioningInfoDocument,
  GetSectioningInfoQuery,
  PlanDocument,
  PlanMutation,
  PlanMutationVariables,
  PlanRequest,
} from "../../types/graphql";
import { OperationTypeName } from "../../types/stan";

/**
 * Get information for the Sectioning page
 */
async function getSectioningInfo() {
  const response = await client.query<GetSectioningInfoQuery>({
    query: GetSectioningInfoDocument,
  });
  return response.data;
}

/**
 * Perform the plan part of Sectioning
 * @param labware list of Labware to be created
 * @param operationType name of the operation (defaults to `"Section"`)
 */
function planSection(
  { labware }: Omit<PlanRequest, "operationType">,
  operationType: OperationTypeName = "Section"
) {
  return client.mutate<PlanMutation, PlanMutationVariables>({
    mutation: PlanDocument,
    variables: { request: { labware, operationType } },
  });
}

export default {
  getSectioningInfo,
  planSection,
};
