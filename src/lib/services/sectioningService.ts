import client from "../client";
import {
  PlanDocument,
  PlanMutation,
  PlanMutationVariables,
  PlanRequest,
} from "../../types/graphql";
import { OperationTypeName } from "../../types/stan";

/**
 * Perform the plan part of Sectioning
 * @param labware list of Labware to be created
 * @param operationType name of the operation (defaults to `"Section"`)
 */
export function planSection(
  { labware }: Omit<PlanRequest, "operationType">,
  operationType: OperationTypeName = "Section"
) {
  return client.mutate<PlanMutation, PlanMutationVariables>({
    mutation: PlanDocument,
    variables: { request: { labware, operationType } },
  });
}
