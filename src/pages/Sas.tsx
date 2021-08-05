import React from "react";
import AppShell from "../components/AppShell";
import SasAllocation from "../components/sasAllocation/SasAllocation";

export default function Sas() {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>SAS Management</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <SasAllocation />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
