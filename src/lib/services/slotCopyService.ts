import { SlotCopyMachine } from "../machines/slotCopy/slotCopyMachineTypes";
import { buildSlotCopyMachine } from "../factories/machineFactory";
import { LabwareTypeName } from "../../types/stan";
import client from "../client";
import {
  SlotCopyDocument,
  SlotCopyMutation,
  SlotCopyMutationVariables,
} from "../../types/graphql";

export async function getVisiumCDNAMachine(): Promise<SlotCopyMachine> {
  return Promise.resolve(
    buildSlotCopyMachine({
      operationType: "Visium cDNA",
      outputLabwareType: LabwareTypeName.PLATE,
    })
  );
}

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
