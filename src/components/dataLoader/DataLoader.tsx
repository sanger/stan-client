import React from "react";
import { useMachine } from "@xstate/react";
import createDataFetcherMachine from "../../lib/machines/dataFetcher/dataFetcherMachine";
import LoadingSpinner from "../icons/LoadingSpinner";
import Warning from "../notifications/Warning";
import WhiteButton from "../buttons/WhiteButton";

export type DataLoaderProps<E> = {
  loader: () => Promise<E>;
  children: (data: E) => React.ReactNode;
  errorMessage?: string;
};

export default function DataLoader<E>({
  loader,
  children,
  errorMessage = "There was an error while loading. Please try again.",
}: DataLoaderProps<E>) {
  const [state, send] = useMachine(
    createDataFetcherMachine({
      context: {
        dataFetcher: loader,
      },
    })
  );

  const { data } = state.context;

  if (state.matches("done")) {
    return <>{children(data)}</>;
  }

  return (
    <div className="mx-auto">
      {state.matches("loading") && <LoadingSpinner />}
      {state.matches("failed") && (
        <Warning message={errorMessage}>
          <WhiteButton onClick={() => send({ type: "RETRY" })}>
            Retry
          </WhiteButton>
        </Warning>
      )}
    </div>
  );
}
