import client from "../client";
import {
  GetPrintersDocument,
  GetPrintersQuery,
  GetPrintersQueryVariables,
  PrintDocument,
  PrintMutation,
  PrintMutationVariables,
} from "../../types/graphql";

/**
 * Fetch all printers from STAN core
 */
export async function getPrinters(): Promise<GetPrintersQuery> {
  const response = await client.query<
    GetPrintersQuery,
    GetPrintersQueryVariables
  >({
    query: GetPrintersDocument,
  });
  return response.data;
}

export function printLabels(variables: PrintMutationVariables) {
  return client.mutate<PrintMutation, PrintMutationVariables>({
    mutation: PrintDocument,
    variables,
  });
}
