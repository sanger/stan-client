import React, { useCallback, useState } from "react";
import { GetSectioningInfoQuery, LabwareFieldsFragment } from "../types/sdk";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import Planner from "../components/planning/Planner";
import { LabwareTypeName } from "../types/stan";
import { buildSampleColors } from "../lib/helpers/labwareHelper";
import { identity } from "lodash";
import PinkButton from "../components/buttons/PinkButton";
import ButtonBar from "../components/ButtonBar";

/**
 * Types of labware the user is allowed to section onto
 */
const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.SLIDE,
  LabwareTypeName.VISIUM_TO,
  LabwareTypeName.VISIUM_LP,
];

type SectioningParams = {
  readonly sectioningInfo: GetSectioningInfoQuery;
};

function Sectioning({ sectioningInfo }: SectioningParams) {
  const [sourceLabware, setSourceLabware] = useState<
    Array<LabwareFieldsFragment>
  >([]);
  /**
   * State to track whether the labware scanner should be locked or not.
   * Once a user has started adding plans, source labware should not change.
   */
  const [isLabwareScannerLocked, setIsLabwareScannerLocked] = useState(false);

  /**
   * The next button should only be enabled when each of the plans has completed.
   */
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

  /**
   * Callback for when a user adds or removes a plan.
   */
  const handlePlanChange = useCallback(
    (numberOfPlans: number, numberOfPlansCompleted: number) => {
      setIsLabwareScannerLocked(numberOfPlans > 0);
      setIsNextButtonEnabled(
        numberOfPlansCompleted > 0 && numberOfPlans === numberOfPlansCompleted
      );
    },
    [setIsLabwareScannerLocked]
  );

  /**
   * A map of sample ID to Tailwind CSS colours.
   * Used by various components to keep the same samples the same colours within different components.
   */
  const sampleColors: Map<number, string> = buildSampleColors(sourceLabware);

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = sectioningInfo.labwareTypes.filter((lw) =>
    allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Plan</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <div className="space-y-4">
            <Heading level={3}>Source Labware</Heading>
            <LabwareScanner
              locked={isLabwareScannerLocked}
              onChange={setSourceLabware}
            >
              <LabwareScanTable
                columns={[
                  labwareScanTableColumns.color(sampleColors),
                  labwareScanTableColumns.barcode(),
                  labwareScanTableColumns.donorId(),
                  labwareScanTableColumns.tissueType(),
                  labwareScanTableColumns.spatialLocation(),
                  labwareScanTableColumns.replicate(),
                ]}
              />
            </LabwareScanner>
          </div>

          <div className="space-y-4">
            <Planner
              operationType={"Section"}
              allowedLabwareTypes={allowedLabwareTypes}
              sourceLabware={sourceLabware}
              showSectionThickness={true}
              sampleColors={sampleColors}
              onPlanChanged={handlePlanChange}
              onPlanCompleted={identity}
            />
          </div>
        </div>
      </AppShell.Main>

      <ButtonBar>
        <PinkButton
          disabled={!isNextButtonEnabled}
          // onClick={model.prepDone}
          action="primary"
        >
          Next {">"}
        </PinkButton>
      </ButtonBar>
    </AppShell>
  );
}

export default Sectioning;
