import React from "react";
import AppShell from "../components/AppShell";
import { useMachine } from "@xstate/react";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/labwareScanPanel/columns";
import Heading from "../components/Heading";
import BlueButton from "../components/buttons/BlueButton";
import { optionValues } from "../components/forms";
import SectioningLayout from "../components/SectioningLayout";
import { find } from "lodash";
import {
  addLabwareLayout,
  deleteLabwareLayout,
  selectLabwareType,
} from "../lib/machines/sectioning/sectioningEvents";
import createSectioningMachine from "../lib/machines/sectioning";

function Sectioning(): JSX.Element {
  const [current, send] = useMachine(createSectioningMachine());
  const {
    outputLabwareTypes,
    selectedLabwareType,
    labwareMachine,
    sampleColors,
    sectioningLayouts,
  } = current.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto space-y-8 mb-24">
          <div>
            <Heading level={3}>Source Labware</Heading>
            {labwareMachine && (
              <LabwareScanTable
                actor={labwareMachine}
                columns={[
                  labwareScanTableColumns.meta(sampleColors),
                  labwareScanTableColumns.barcode(),
                  labwareScanTableColumns.donorId(),
                  labwareScanTableColumns.tissueType(),
                  labwareScanTableColumns.spatialLocation(),
                  labwareScanTableColumns.replicate(),
                ]}
              />
            )}
          </div>

          <div className="space-y-4">
            {sectioningLayouts.length > 0 && (
              <Heading level={3}>Layouts</Heading>
            )}

            {sectioningLayouts.map((sectioningLayout, i) => (
              <SectioningLayout
                key={i}
                onDelete={() => send(deleteLabwareLayout(i))}
                actor={sectioningLayout.ref}
              />
            ))}
          </div>

          <div className="mb-24">
            <Heading level={3}>Add Destination Labware</Heading>
            <div>
              <p className="text-sm">
                Once all blocks have been scanned, select a type of labware to
                plan Sectioning layouts:
              </p>
              <div className="mt-8 flex flex-row items-center justify-center gap-4">
                <select
                  value={selectedLabwareType?.name}
                  onChange={(e) => {
                    const labwareType = find(
                      outputLabwareTypes,
                      (lt) => lt.name === e.currentTarget.value
                    );

                    if (labwareType) {
                      send(selectLabwareType(labwareType));
                    }
                  }}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
                >
                  {optionValues(outputLabwareTypes, "name", "name")}
                </select>
                <BlueButton
                  id="#addLabware"
                  disabled={!current.matches("started")}
                  onClick={(_e) => {
                    if (!current.matches("started")) {
                      return;
                    }
                    send(addLabwareLayout());
                  }}
                  className="whitespace-nowrap"
                  action={"secondary"}
                >
                  + Add Labware
                </BlueButton>
              </div>
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Sectioning;
