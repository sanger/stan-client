import React from "react";
import AppShell from "../components/AppShell";
import WorkAllocation from "../components/workAllocation/WorkAllocation";

export default function SGP() {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>SGP Management</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <WorkAllocation />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
