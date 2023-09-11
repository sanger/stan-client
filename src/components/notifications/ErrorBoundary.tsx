import Warning from './Warning';
import WhiteButton from '../buttons/WhiteButton';
import React from 'react';
import { reload } from '../../lib/sdk';
import { useNavigate } from 'react-router-dom';
import AppShell from '../AppShell';

const ErrorBoundary = () => {
  const navigate = useNavigate();
  debugger;
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Error</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Warning message={'There was an error while trying to load the page. Please try again.'}>
            <WhiteButton onClick={() => reload(navigate)}>Retry</WhiteButton>
          </Warning>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ErrorBoundary;
