/**
 * Returns a {@link Promise} that will only resolve once the passed in service has
 * resolved, and the `minimumWait` has passed
 * @param minimumWait the minimum time to wait before resolving (in milliseconds)
 * @param invokeSrc the service to invoke
 *
 * @see {@link https://xstate.js.org/docs/guides/communication.html#invoking-promises}
 */
import { EventObject, StateSchema } from 'xstate/lib/types';
import { Machine, MachineConfig, MachineOptions } from 'xstate';

export const createMinimumWaitService = <TResult>(
  minimumWait: number,
  invokeSrc: () => Promise<TResult>
): Promise<TResult> => {
  const minimumWaitPromise = () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(undefined), minimumWait);
    });

  return Promise.all([minimumWaitPromise(), invokeSrc()]).then((res) => res[1]);
};

export interface CreateMachineParams<TContext, TEvent extends EventObject> {
  context?: Partial<TContext>;
  options?: Partial<MachineOptions<TContext, TEvent>>;
}

/**
 * Returns a function that can build a specific type of state machine.
 * The function also allows passing in {@link CreateMachineParams} for easy machine extension
 *
 * @param machineConfig the default config of this machine
 * @param machineOptions the default options of this machine
 *
 * @example
 * // create a dataFetcherMachine builder
 * const createDataFetcherMachine = createMachineBuilder<
 *   DataFetcherContext,
 *   DataFetcherSchema,
 *   DataFetcherEvent
 * >(machineConfig, machineOptions);
 *
 * // build a dataFetcherMachine
 * const machine = createDataFetcherMachine({ context: myCustomContext, options: myCustomOptions });
 */
export function createMachineBuilder<TContext, TStateSchema extends StateSchema, TEvent extends EventObject>(
  machineConfig: MachineConfig<TContext, TStateSchema, TEvent>,
  machineOptions: Partial<MachineOptions<TContext, TEvent>>
) {
  return (params?: CreateMachineParams<TContext, TEvent>) => {
    let machine = Machine<TContext, TStateSchema, TEvent>(machineConfig, machineOptions);

    if (params?.options) {
      machine = machine.withConfig(params.options);
    }

    if (params?.context) {
      const newContext: TContext = Object.assign({}, machine.context, params.context);
      machine = machine.withContext(newContext);
    }

    return machine;
  };
}
