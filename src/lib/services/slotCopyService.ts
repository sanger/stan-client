import client from "../client";
import {
  SlotCopyDocument,
  SlotCopyMutation,
  SlotCopyMutationVariables,
} from "../../types/graphql";

export async function copySlots(request: SlotCopyMutationVariables["request"]) {
  const { data } = await client.mutate<
    SlotCopyMutation,
    SlotCopyMutationVariables
  >({
    mutation: SlotCopyDocument,
    variables: { request },
  });

  return data;
}
