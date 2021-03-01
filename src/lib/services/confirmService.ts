import client from "../client";
import {
  ConfirmDocument,
  ConfirmMutation,
  ConfirmMutationVariables,
  ConfirmOperationRequest,
} from "../../types/graphql";

/**
 * Sends a Confirm mutation to the API
 * @param request
 */
export function confirm(request: ConfirmOperationRequest) {
  return client.mutate<ConfirmMutation, ConfirmMutationVariables>({
    mutation: ConfirmDocument,
    variables: { request },
  });
}
