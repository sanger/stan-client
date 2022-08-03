import React from 'react';
import AppShell from '../components/AppShell';
import LoadingSpinnerIcon from '../components/icons/LoadingSpinner';

const Loading = () => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Loading...</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <LoadingSpinnerIcon />
      </AppShell.Main>
    </AppShell>
  );
};

export default Loading;
