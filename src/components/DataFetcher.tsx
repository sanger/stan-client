import React from 'react';
import LoadingSpinner from './icons/LoadingSpinner';
import Warning from './notifications/Warning';
import WhiteButton from './buttons/WhiteButton';
import { useMachine } from '@xstate/react';
import createDataFetcherMachine from '../lib/machines/dataFetcher/dataFetcherMachine';
import AppShell from './AppShell';

export interface DataFetcherProps<E> {
  dataFetcher: () => Promise<E>;
  children: (data: E) => React.ReactNode | JSX.Element;
}
/**
 * Component that will show a loading page for you while fetching some data
 *
 * @param dataFetcher a promise that resolves with the data a page needs
 * @param children render function that accepts the fetched data
 * @constructor
 */
const DataFetcher = <E extends unknown>({ dataFetcher, children }: DataFetcherProps<E>) => {
  const [state, send] = useMachine(
    createDataFetcherMachine({
      context: {
        dataFetcher
      }
    })
  );
  const { data } = state.context;

  if (state.matches('done')) {
    return <>{children(data)}</>;
  }

  const title = state.matches('loading') ? 'Loading' : 'Error';

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {state.matches('loading') && <LoadingSpinner />}
          {state.matches('failed') && (
            <Warning message={'There was an error while trying to load the page. Please try again.'}>
              <WhiteButton onClick={() => send({ type: 'RETRY' })}>Retry</WhiteButton>
            </Warning>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default DataFetcher;
