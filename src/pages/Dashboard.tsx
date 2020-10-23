import React from "react";
import AppShell from "../components/AppShell";

function Dashboard(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Dashboard</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <p>Welcome to the Dashboard!</p>
      </AppShell.Main>
    </AppShell>
  );
}

export default Dashboard;
