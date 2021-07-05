import React from "react";
import AppShell from "../components/AppShell";
import LabwareView from "../components/labware/Labware";
import { LabwareFieldsFragment } from "../types/sdk";
import StripyCard, { StripyCardDetail } from "../components/StripyCard";
import Heading from "../components/Heading";
import LabelPrinter from "../components/LabelPrinter";
import DataTable from "../components/DataTable";
import Pill from "../components/Pill";
import * as sampleColumns from "../components/dataTable/sampleColumns";
import { Authenticated } from "../components/Authenticated";
import { isLabwareUsable } from "../lib/helpers/labwareHelper";

/**
 * Props passed in to the {@link LabwareDetails} page
 */
type LabwareDetailsProps = {
  labware: LabwareFieldsFragment;
};

export default function LabwareDetails({ labware }: LabwareDetailsProps) {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{labware.barcode}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto space-y-8">
          <div className="rounded-lg p-8 bg-gray-100 flex flex-row items-top justify-around">
            <div>
              <LabwareView
                labware={labware}
                name={labware.labwareType.name}
                selectable={"none"}
              />
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <Heading level={4}>Labware Details</Heading>

                <StripyCard heading={labware.barcode}>
                  <StripyCardDetail term={"Labware type"}>
                    {labware.labwareType.name}
                  </StripyCardDetail>

                  <StripyCardDetail term={"Date of Creation"}>
                    {labware.created}
                  </StripyCardDetail>

                  <StripyCardDetail term={"State"}>
                    <Pill color={isLabwareUsable(labware) ? "blue" : "pink"}>
                      {labware.state.toUpperCase()}
                    </Pill>
                  </StripyCardDetail>
                </StripyCard>
              </div>

              {isLabwareUsable(labware) && (
                <Authenticated>
                  <div className="space-y-4">
                    <Heading level={4}>Re-Print Labels</Heading>
                    <LabelPrinter labwares={[labware]} />
                  </div>
                </Authenticated>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Heading level={2}>Samples</Heading>

            <DataTable
              columns={[
                sampleColumns.slotAddress(),
                sampleColumns.tissueType(),
                sampleColumns.sectionNumber(),
                sampleColumns.bioState(),
                sampleColumns.replicateNumber(),
                sampleColumns.spatialLocation(),
                sampleColumns.lifeStage(),
                sampleColumns.donorName(),
              ]}
              data={sampleColumns.buildSampleDataTableRows(labware)}
            />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
