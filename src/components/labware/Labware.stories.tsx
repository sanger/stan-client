import React, { ComponentProps } from "react";
import { Meta, Story } from "@storybook/react";

import Labware from "./Labware";
import {
  plateFactory,
  visiumLPFactory,
} from "../../lib/factories/labwareFactory";

const meta: Meta = {
  title: "Labware",
  component: Labware,
};
export default meta;

const Template: Story<ComponentProps<typeof Labware>> = (args) => (
  <Labware {...args} />
);

export const Plate = Template.bind({});
Plate.args = {
  labware: plateFactory.build(),
  slotColor: (address, slot) => {
    if (slot != null) {
      return "sdb-400";
    }
  },
};

export const VisiumLP = Template.bind({});
VisiumLP.args = {
  labware: visiumLPFactory.build(),
};
