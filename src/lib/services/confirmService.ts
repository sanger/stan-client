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
function confirm(request: ConfirmOperationRequest) {
  return client.mutate<ConfirmMutation, ConfirmMutationVariables>({
    mutation: ConfirmDocument,
    variables: { request },
  });
}

const fns = {
  confirm,
};

export default fns;
