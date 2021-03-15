import React, { ComponentProps } from "react";
import { Story, Meta } from "@storybook/react";

import Pager from "./Pager";

const meta: Meta = {
  title: "Pager",
  component: Pager,
};
export default meta;

const Template: Story<ComponentProps<typeof Pager>> = (args) => (
  <Pager {...args} />
);

export const Default = Template.bind({});
Default.args = {
  numberOfPages: 5,
};
