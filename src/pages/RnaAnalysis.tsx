import React, { useCallback, useMemo } from "react";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import Heading from "../components/Heading";
import { rnaAnalysisMachine } from "../lib/machines/analysis/rnaAnalysisMachine";
import {LabwareFieldsFragment, PassFail } from "../types/sdk";
import { useMachine } from "@xstate/react";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import labwareScanTableColumns, {
} from "../components/dataTable/labwareColumns";
import {Column} from "react-table";

export type ExtractionResultType = {
  labware: LabwareFieldsFragment;
  result: PassFail;
  concentration: string;
};

function RnaAnalysis() {
  const [current, send] = useMachine(() =>
    rnaAnalysisMachine.withContext({ labwares: [] })
  );



  const nanoDropResultColumn:Column<ExtractionResultFields> = React.useMemo(() => {
    return {
      id: "nanodropresult",
      Header: "Nanodrop result",
      accessor: (data) => data.concentration,
    };
  },[];

  const columns = useMemo(
    () => [
      labwareScanTableColumns.barcode(),
      labwareScanTableColumns.externalName(),
      labwareScanTableColumns.tissueType(),
      labwareScanTableColumns.medium(),
      labwareScanTableColumns.fixative(),
      nanoDropResultColumn(),
    ],
    []
  );

  const handleWorkNumberChange = useCallback((workNumber?: string) => {
    send({ type: "UPDATE_WORK_NUMBER", workNumber });
  }, []);

  const onLabwareScannerChange = (labwares: Array<LabwareFieldsFragment>) =>
    send({ type: "UPDATE_LABWARES", labwares });

  const scannerLocked =
    !current.matches("ready") && !current.matches("extractionFailed");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title> Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">
              You may optionally select an SGP number to associate with this
              extraction.
            </p>
            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <Heading level={3}> Section Tubes </Heading>
            <LabwareScanner
              onChange={onLabwareScannerChange}
              locked={scannerLocked}
            >
              <LabwareScanPanel columns={columns} />
            </LabwareScanner>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
export default RnaAnalysis;
