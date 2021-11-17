import { Interpreter } from "xstate";

/**
 * The type of an interpreted DataFetcherPage Machine
 */
export type DataFetcherMachineType = Interpreter<
  DataFetcherContext,
  DataFetcherSchema,
  DataFetcherEvent
>;

/**
 * State Schema for a DataFetcherPage Machine
 */
export interface DataFetcherSchema {
  states: {
    loading: {};
    failed: {};
    done: {};
  };
}

/**
 * Context for a DataFetcherPage Machine
 */
export interface DataFetcherContext<> {
  dataFetcher: () => Promise<any>;
  data: any;
}

type RetryEvent = { type: "RETRY" };

export type DataFetcherEvent = RetryEvent;
