import {
  RegisterOriginalSamplesDocument,
  RegisterOriginalSamplesMutation,
  RegisterOriginalSamplesMutationVariables
} from '../../types/sdk';
import { graphQLClient } from '../sdk';

export async function registerOriginalSamples(mutationVariables: RegisterOriginalSamplesMutationVariables) {
  const response = await graphQLClient.rawRequest<RegisterOriginalSamplesMutation>(
    RegisterOriginalSamplesDocument,
    mutationVariables
  );
  return response.data.registerOriginalSamples;
}
