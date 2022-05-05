import {
  RegisterTissueSamplesDocument,
  RegisterTissueSamplesMutation,
  RegisterTissueSamplesMutationVariables,
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
  return response.data.register;
}

export async function registerTissueSamples(
  mutationVariables: RegisterTissueSamplesMutationVariables
) {
  const response = await graphQLClient.rawRequest<
    RegisterTissueSamplesMutation
  >(RegisterTissueSamplesDocument, mutationVariables);
  return response.data.registerTissueSamples;
}
