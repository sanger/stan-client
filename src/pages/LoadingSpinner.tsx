import React from "react";
import AppShell from "../components/AppShell";
import LoadingSpinnerIcon from "../components/icons/LoadingSpinner";

const LoadingSpinner = () => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Reports</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <LoadingSpinnerIcon />
      </AppShell.Main>
    </AppShell>
  );
};

export default LoadingSpinner;
