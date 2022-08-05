import {
  RegisterOriginalSamplesDocument,
  RegisterOriginalSamplesMutation,
  RegisterOriginalSamplesMutationVariables,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables
} from '../../types/sdk';
import { graphQLClient } from '../sdk';

/**
 * Calls the register GraphQL mutation
 * @param mutationVariables
 */
export async function registerTissues(mutationVariables: RegisterTissuesMutationVariables) {
  const response = await graphQLClient.rawRequest<RegisterTissuesMutation>(RegisterTissuesDocument, mutationVariables);
  return response.data.register;
}

export async function registerOriginalSamples(mutationVariables: RegisterOriginalSamplesMutationVariables) {
  const response = await graphQLClient.rawRequest<RegisterOriginalSamplesMutation>(
    RegisterOriginalSamplesDocument,
    mutationVariables
  );
  return response.data.registerOriginalSamples;
}
