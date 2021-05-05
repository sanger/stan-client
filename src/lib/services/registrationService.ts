import {
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../types/sdk";
import { graphQLClient } from "../sdk";

/**
 * Calls the register GraphQL mutation
 * @param mutationVariables
 */
export async function registerTissues(
  mutationVariables: RegisterTissuesMutationVariables
) {
  const response = await graphQLClient.rawRequest<RegisterTissuesMutation>(
    RegisterTissuesDocument,
    mutationVariables
  );

  return response.data;
}
