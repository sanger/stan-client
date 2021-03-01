import client from "../client";
import {
  FindLabwareDocument,
  FindLabwareQuery,
  FindLabwareQueryVariables,
} from "../../types/graphql";

/**
 * Find a piece of labware by its barcode
 *
 * @param barcode barcode of the labware to find
 */
export async function findLabwareByBarcode(barcode: string) {
  const response = await client.query<
    FindLabwareQuery,
    FindLabwareQueryVariables
  >({
    query: FindLabwareDocument,
    variables: { barcode },
  });

  return response.data.labware;
}
