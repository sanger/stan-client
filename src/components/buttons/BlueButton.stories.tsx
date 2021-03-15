import React, { ComponentProps } from "react";
import { Story, Meta } from "@storybook/react";

import BlueButton from "./BlueButton";

const meta: Meta = {
  title: "BlueButton",
  component: BlueButton,
};
export default meta;

const Template: Story<ComponentProps<typeof BlueButton>> = ({
  children,
  ...args
}) => <BlueButton {...args}>{children}</BlueButton>;

export const Primary = Template.bind({});

Primary.args = {
  children: "Save",
};
