import React, { useCallback, useMemo } from "react";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import Heading from "../components/Heading";
import { rnaAnalysisMachine } from "../lib/machines/analysis/rnaAnalysisMachine";
import { LabwareFieldsFragment, PassFail } from "../types/sdk";
import { useMachine } from "@xstate/react";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import { Column } from "react-table";

export type ExtractionResultType = {
  labware: LabwareFieldsFragment;
  result: PassFail;
  concentration: string;
};

function RnaAnalysis() {
  const [current, send] = useMachine(() =>
    rnaAnalysisMachine.withContext({ labware: undefined, extractionResult: [] })
  );

  const columns = useMemo(
    () => [
      labwareScanTableColumns.barcode(),
      labwareScanTableColumns.externalName(),
      labwareScanTableColumns.tissueType(),
      labwareScanTableColumns.medium(),
      labwareScanTableColumns.fixative(),
    ],
    []
  );

  const onLabwareScannerChange = (labwares: Array<LabwareFieldsFragment>) => {
    // send({ type: "UPDATE_LABWARES", labware: labwares[0] });
  };

  const scannerLocked =
    !current.matches("ready") && !current.matches("extractionFailed");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title> Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="mt-8 space-y-4">
            <Heading level={3}> Section Tubes </Heading>
            <LabwareScanner
              onChange={onLabwareScannerChange}
              locked={scannerLocked}
            >
              {}
            </LabwareScanner>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
export default RnaAnalysis;
