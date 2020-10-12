import React from "react";
import AppShell from "../components/AppShell";

function Admin(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Admin</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <p>Congratulations! You have reached the Admin page.</p>
      </AppShell.Main>
    </AppShell>
  );
}

export default Admin;
