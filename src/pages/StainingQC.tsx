import React from "react";
import { GetStainingQcInfoQuery } from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export default function StainingQC({ info }: StainingQCProps) {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div>
          <WorkNumberSelect onWorkNumberChange={() => {}} />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
