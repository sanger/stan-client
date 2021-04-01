import {
  GetRegistrationInfoDocument,
  GetRegistrationInfoQuery,
  RegisterSectionsDocument,
  RegisterSectionsMutation,
  RegisterSectionsMutationVariables,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
  SectionRegisterRequest,
} from "../../types/graphql";
import client from "../client";

/**
 * Gets all the information necessary for Registration
 */
export async function getRegistrationInfo(): Promise<GetRegistrationInfoQuery> {
  const response = await client.query({ query: GetRegistrationInfoDocument });
  return response.data;
}

/**
 * Calls the register GraphQL mutation
 * @param mutationVariables
 */
export function registerTissues(
  mutationVariables: RegisterTissuesMutationVariables
) {
  return client.mutate<
    RegisterTissuesMutation,
    RegisterTissuesMutationVariables
  >({
    mutation: RegisterTissuesDocument,
    variables: mutationVariables,
  });
}

/**
 * Calls the registerSections GraphQL mutation
 * @param request variables for the registration
 */
export async function registerSections(request: SectionRegisterRequest) {
  const response = await client.mutate<
    RegisterSectionsMutation,
    RegisterSectionsMutationVariables
  >({
    mutation: RegisterSectionsDocument,
    variables: { request },
  });

  return response.data;
}
