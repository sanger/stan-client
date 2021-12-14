import React from "react";
import AppShell from "../components/AppShell";
import LabwareView from "../components/labware/Labware";
import {
  AddressPermDataFieldsFragment,
  LabwareFieldsFragment,
  SlotFieldsFragment,
} from "../types/sdk";
import StripyCard, { StripyCardDetail } from "../components/StripyCard";
import Heading from "../components/Heading";
import LabelPrinter from "../components/LabelPrinter";
import DataTable from "../components/DataTable";
import * as sampleColumns from "../components/dataTable/sampleColumns";
import { Authenticated } from "../components/Authenticated";
import { isLabwareUsable } from "../lib/helpers/labwareHelper";
import History from "../components/history/History";
import { LabwareStatePill } from "../components/LabwareStatePill";
import { isSlotFilled } from "../lib/helpers/slotHelper";

/**
 * Props passed in to the {@link LabwareDetails} page
 */
type LabwareDetailsProps = {
  labware: LabwareFieldsFragment;
  permData?: AddressPermDataFieldsFragment[];
};

export default function LabwareDetails({
  labware,
  permData,
}: LabwareDetailsProps) {
  const getPermDataForSlot = (
    slot: SlotFieldsFragment,
    permData: AddressPermDataFieldsFragment[]
  ): AddressPermDataFieldsFragment | undefined => {
    /**
     * PermData contains all the permtimes recorded for the address and we need to display only the latest
     */
    const addressPermDataArr: AddressPermDataFieldsFragment[] = permData.filter(
      (addressPermData) => addressPermData.address === slot.address
    );
    return addressPermDataArr.length > 0
      ? addressPermDataArr[addressPermDataArr.length - 1]
      : undefined;
  };
  const slotBuilder = (slot: SlotFieldsFragment): React.ReactNode => {
    if (!permData || !isSlotFilled(slot)) {
      return <></>;
    }
    const addressPermData = getPermDataForSlot(slot, permData);
    return (
      <div
        className={`flex flex-row items-center justify-between gap-x-2 mt-2 ${
          addressPermData?.selected && `text-blue-600 font-bold`
        }`}
      >
        {addressPermData && (
          <div className="flex flex-row items-center justify-between">
            {`Perm time : ${
              addressPermData.seconds
                ? `${Math.floor(addressPermData.seconds / 60)} min`
                : "nil"
            }`}
          </div>
        )}
      </div>
    );
  };

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
                slotBuilder={
                  permData && permData.length > 0 ? slotBuilder : undefined
                }
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
                    <LabwareStatePill labware={labware} />
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

          <div className="space-y-4">
            <Heading level={2}>Labware History</Heading>
            <History kind={"labwareBarcode"} value={labware.barcode} />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
