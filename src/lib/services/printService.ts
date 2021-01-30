import client from "../client";
import {
  GetPrintersDocument,
  GetPrintersQuery,
  GetPrintersQueryVariables,
  PrintDocument,
  PrintMutation,
  PrintMutationVariables,
} from "../../types/graphql";

export function getPrinters() {
  return client.query<GetPrintersQuery, GetPrintersQueryVariables>({
    query: GetPrintersDocument,
  });
}

export function printLabels(variables: PrintMutationVariables) {
  return client.mutate<PrintMutation, PrintMutationVariables>({
    mutation: PrintDocument,
    variables,
  });
}
