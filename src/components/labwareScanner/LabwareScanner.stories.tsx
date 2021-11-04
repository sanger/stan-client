import React, { ComponentProps } from "react";
import { Meta, Story } from "@storybook/react";

import LabwareScanner, { useLabwareContext } from "./LabwareScanner";
import LabwareScanPanel from "../labwareScanPanel/LabwareScanPanel";
import columns from "../dataTable/labwareColumns";
import LabwareScannerSlotsTable from "./LabwareScannerSlotsTable";

const meta: Meta = {
  title: "LabwareScanner",
  component: LabwareScanner,
};
export default meta;

export const LabwareScannerList: Story<ComponentProps<
  typeof LabwareScanner
>> = (args) => {
  return (
    <LabwareScanner {...args}>
      <List />
    </LabwareScanner>
  );
};

const List = () => {
  const { labwares, removeLabware } = useLabwareContext();

  return (
    <ul>
      {labwares.map((lw) => (
        <li>
          {lw.barcode}{" "}
          <button
            onClick={() => removeLabware(lw.barcode)}
            className="text-red-500 font-bold underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
};

export const LabwareScannerTable: Story<ComponentProps<
  typeof LabwareScanner
>> = (args) => {
  return (
    <LabwareScanner {...args}>
      <LabwareScanPanel
        columns={[
          columns.barcode(),
          columns.externalName(),
          columns.labwareType(),
        ]}
      />
    </LabwareScanner>
  );
};

export const LabwareScannerSlotsTableStory: Story<ComponentProps<
  typeof LabwareScanner
>> = (args) => {
  return (
    <LabwareScanner {...args}>
      <LabwareScannerSlotsTable />
    </LabwareScanner>
  );
};
