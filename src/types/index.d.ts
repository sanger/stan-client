import { graphql } from "msw";
import { worker } from "../mocks/browser";

export type graphqlType = typeof graphql;
export type workerType = typeof worker;

// Make the `worker` and `graphql` references available globally,
// so they can be accessed in both runtime and test suites.
declare global {
  interface Window {
    msw: {
      worker: workerType;
      graphql: graphqlType;
    };
    postMSWStart?: (worker: workerType, graphql: graphqlType) => void;
  }
}
