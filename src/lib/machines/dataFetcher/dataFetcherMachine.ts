import { MachineConfig, MachineOptions } from "xstate";
import {
  DataFetcherContext,
  DataFetcherEvent,
  DataFetcherSchema,
} from "./dataFetcherMachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";

/**
 * DataFetcherPage Machine Options
 */
export const machineOptions: Partial<MachineOptions<
  DataFetcherContext,
  DataFetcherEvent
>> = {
  services: {
    fetchData: (ctx) => ctx.dataFetcher(),
  },
};

/**
 * DataFetcherPage Machine Config
 */
export const machineConfig: MachineConfig<
  DataFetcherContext,
  DataFetcherSchema,
  DataFetcherEvent
> = {
  id: "dataFetcher",
  initial: "loading",
  states: {
    loading: {
      invoke: {
        src: "fetchData",
        onDone: {
          target: "done",
          actions: assign((ctx, e) => {
            ctx.data = e.data;
          }),
        },
        onError: "failed",
      },
    },
    failed: {
      on: {
        RETRY: "loading",
      },
    },
    done: {
      type: "final",
    },
  },
};

const createDataFetcherMachine = createMachineBuilder<
  DataFetcherContext,
  DataFetcherSchema,
  DataFetcherEvent
>(machineConfig, machineOptions);

export default createDataFetcherMachine;
