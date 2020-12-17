import React from "react";
import AppShell from "../../components/AppShell";
import Heading from "../../components/Heading";
import LabwareScanTable from "../../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../../components/labwareScanPanel/columns";
import SectioningLayout from "../../components/SectioningLayout";
import {
  addLabwareLayout,
  deleteLabwareLayout,
  prepDone,
  selectLabwareType,
} from "../../lib/machines/sectioning/sectioningEvents";
import { find } from "lodash";
import { optionValues } from "../../components/forms";
import BlueButton from "../../components/buttons/BlueButton";
import PinkButton from "../../components/buttons/PinkButton";
import { useScrollToRef } from "../../hooks";
import { SectioningMachineType } from "../../lib/machines/sectioning/sectioningTypes";

interface PlanProps {
  current: SectioningMachineType["state"];
  send: SectioningMachineType["send"];
}

const Plan: React.FC<PlanProps> = ({ current, send }) => {
  const [ref, scrollToRef] = useScrollToRef();

  const {
    outputLabwareTypes,
    selectedLabwareType,
    labwareMachine,
    sampleColors,
    sectioningLayouts,
    numSectioningLayoutsComplete,
  } = current.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Plan</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <div>
            <Heading level={3}>Source Labware</Heading>
            {labwareMachine && (
              <LabwareScanTable
                actor={labwareMachine}
                columns={[
                  labwareScanTableColumns.color(sampleColors),
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
                ref={i === sectioningLayouts.length - 1 ? ref : null}
                key={i}
                onDelete={() => send(deleteLabwareLayout(i))}
                actor={sectioningLayout.ref}
              />
            ))}
          </div>
        </div>
      </AppShell.Main>

      <div className="flex-shrink-0 max-w-screen-xl mx-auto">
        <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
          <p className="my-3 text-gray-800 text-sm leading-normal">
            Once <span className="font-bold text-gray-900">all blocks</span>{" "}
            have been scanned, select a type of labware to plan Sectioning
            layouts:
          </p>

          <div className="flex flex-row items-center justify-center gap-4">
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
                scrollToRef();
              }}
              className="whitespace-nowrap"
              action={"primary"}
            >
              + Add Labware
            </BlueButton>
          </div>
        </div>
      </div>

      {/* TODO: Maybe make this into some kind of <ButtonBar /> component */}
      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-row items-center justify-between">
            <PinkButton action="tertiary">Cancel</PinkButton>
            <PinkButton
              disabled={
                !(
                  sectioningLayouts.length > 0 &&
                  sectioningLayouts.length === numSectioningLayoutsComplete
                )
              }
              onClick={() => send(prepDone())}
              action="primary"
            >
              Next {">"}
            </PinkButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Plan;
