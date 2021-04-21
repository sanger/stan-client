import { worker } from "../mocks/browser";
import { graphql } from "msw";
import { StanConfig } from "./stan";

export type workerType = typeof worker;

export type graphqlType = typeof graphql;
// Make the `worker` and `graphql` references available globally,
// so they can be accessed in both runtime and test suites.
declare global {
  interface Window {
    STAN_CONFIG?: StanConfig;
    msw: {
      worker: workerType;
      graphql: graphqlType;
    };
    postMSWStart?: (worker: workerType, graphql: graphqlType) => void;
  }
}
