import React from "react";
import AppShell from "../components/AppShell";
import { useMachine } from "@xstate/react";
import sectioningMachine from "../lib/machines/sectioningMachine";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/labwareScanPanel/columns";

function Sectioning(): JSX.Element {
  const [current] = useMachine(sectioningMachine);
  const { labwareMachine } = current.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto space-y-4">
          {labwareMachine && (
            <LabwareScanTable
              actor={labwareMachine}
              columns={[
                labwareScanTableColumns.barcode(),
                labwareScanTableColumns.donorId(),
                labwareScanTableColumns.tissueType(),
                labwareScanTableColumns.spatialLocation(),
                labwareScanTableColumns.replicate(),
              ]}
            />
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Sectioning;
