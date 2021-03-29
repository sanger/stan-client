import React, { ComponentPropsWithoutRef } from "react";
import { Meta, Story } from "@storybook/react";

import ScanInput from "./ScanInput";

const meta: Meta = {
  title: "ScanInput",
  component: ScanInput,
};
export default meta;

const Template: Story<ComponentPropsWithoutRef<typeof ScanInput>> = (args) => (
  <ScanInput {...args} />
);

export const WithAlertCallback = Template.bind({});
WithAlertCallback.args = {
  onScan: (value: string) => alert(`"${value}" scanned`),
};
