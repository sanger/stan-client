import React, { useCallback, useEffect, useState } from "react";
import {
  GetStainingQcInfoQuery,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareResult from "../components/labwareResult/LabwareResult";
import { pick } from "lodash";

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export default function StainingQC({ info }: StainingQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [labwares, setLabwares] = useState<Array<LabwareFieldsFragment>>([]);
  const [labwareResults, setLabwareResults] = useState<{
    [key: string]: CoreLabwareResult;
  }>({});

  /**
   * Update labwareResults whenever labwares changes (e.g. labware may have been deleted)
   */
  useEffect(() => {
    const labwareBarcodes = labwares.map((lw) => lw.barcode);
    setLabwareResults((labwareResults) => {
      return pick(labwareResults, labwareBarcodes);
    });
  }, [labwares]);

  /**
   * Callback to handle when one of the LabwareResult components changes.
   * Will replace single LabwareResult in list, leaving others untouched.
   */
  const handleLabwareResultChange = useCallback(
    (labwareResult: CoreLabwareResult) => {
      setLabwareResults((labwareResults) => {
        return {
          ...labwareResults,
          ...{ [labwareResult.barcode]: labwareResult },
        };
      });
    },
    []
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div>
          <WorkNumberSelect onWorkNumberChange={setWorkNumber} />

          <LabwareScanner onChange={setLabwares}>
            {({ labwares, removeLabware }) =>
              labwares.map((labware) => (
                <LabwareResult
                  key={labware.barcode}
                  labware={labware}
                  availableComments={info.comments}
                  onRemoveClick={removeLabware}
                  onChange={handleLabwareResultChange}
                />
              ))
            }
          </LabwareScanner>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
