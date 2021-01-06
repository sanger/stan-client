/**
 * Returns a {@link Promise} that will only resolve once the passed in service has
 * resolved, and the `minimumWait` has passed
 * @param minimumWait the minimum time to wait before resolving (in milliseconds)
 * @param invokeSrc the service to invoke
 *
 * @see {@link https://xstate.js.org/docs/guides/communication.html#invoking-promises}
 */
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
