import React, { useCallback, useMemo } from "react";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import Heading from "../components/Heading";
import { rnaAnalysisMachine } from "../lib/machines/analysis/rnaAnalysisMachine";
import { LabwareFieldsFragment } from "../types/sdk";
import { useMachine } from "@xstate/react";
import ScanInput from "../components/scanInput/ScanInput";
import Warning from "../components/notifications/Warning";
import DataTable from "../components/DataTable";
import ExtractionResultPanel from "../components/extractResult/ExtractResultPanel";
import ExtractResultPanel from "../components/extractResult/ExtractResultPanel";

function RnaAnalysis() {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title> Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="mt-8 space-y-4">
            <Heading level={3}> Section Tubes </Heading>
            <ExtractResultPanel />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
export default RnaAnalysis;
