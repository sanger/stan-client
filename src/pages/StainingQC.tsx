import React, { useCallback, useContext, useEffect, useState } from "react";
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
import WhiteButton from "../components/buttons/WhiteButton";
import { StanCoreContext } from "../lib/sdk";

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export default function StainingQC({ info }: StainingQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [labwares, setLabwares] = useState<Array<LabwareFieldsFragment>>([]);
  const [labwareResults, setLabwareResults] = useState<{
    [key: string]: CoreLabwareResult;
  }>({});
  const stanCore = useContext(StanCoreContext);
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
          <div className={"flex flex-row items-center justify-end"}>
            <WhiteButton
              disabled={labwares.length <= 0}
              onClick={() =>
                stanCore.RecordStainResult({
                  request: {
                    labwareResults: Object.values(labwareResults),
                    workNumber: workNumber,
                  },
                })
              }
            >
              Save
            </WhiteButton>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
