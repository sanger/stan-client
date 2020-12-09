import client from "../client";
import {
  GetPrintersDocument,
  GetPrintersQuery,
  GetPrintersQueryVariables,
  PrintDocument,
  PrintMutation,
  PrintMutationVariables,
} from "../../types/graphql";

function getPrinters() {
  return client.query<GetPrintersQuery, GetPrintersQueryVariables>({
    query: GetPrintersDocument,
  });
}

function printLabels(variables: PrintMutationVariables) {
  return client.mutate<PrintMutation, PrintMutationVariables>({
    mutation: PrintDocument,
    variables,
  });
}

const fns = {
  getPrinters,
  printLabels,
};

export default fns;
