import { ApolloQueryResult, FetchResult } from "@apollo/client";
import {
  GetRegistrationInfoDocument,
  GetRegistrationInfoQuery,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../types/graphql";
import client from "../client";

/**
 * Gets all the information necessary for Registration
 */
function getRegistrationInfo(): Promise<
  ApolloQueryResult<GetRegistrationInfoQuery>
> {
  return client.query({ query: GetRegistrationInfoDocument });
}

/**
 * Calls the register GraphQL mutation
 * @param mutationVariables
 */
function registerTissues(mutationVariables: RegisterTissuesMutationVariables) {
  return client.mutate<
    RegisterTissuesMutation,
    RegisterTissuesMutationVariables
  >({
    mutation: RegisterTissuesDocument,
    variables: mutationVariables,
  });
}

const fns = {
  getRegistrationInfo,
  registerTissues,
};

export default fns;
