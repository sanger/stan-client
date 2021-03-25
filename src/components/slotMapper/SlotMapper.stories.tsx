import React, { ComponentProps } from "react";
import { Meta, Story } from "@storybook/react";

import SlotMapper from "./SlotMapper";
import labwareFactory from "../../lib/factories/labwareFactory";
import { labwareTypes } from "../../lib/factories/labwareTypeFactory";
import { LabwareTypeName } from "../../types/stan";
import { slotFactory } from "../../lib/factories/slotFactory";
import { genAddresses } from "../../lib/helpers";
import { sampleSize } from "lodash";

const meta: Meta = {
  title: "Slot Mapper",
  component: SlotMapper,
};

export default meta;

const Template: Story<ComponentProps<typeof SlotMapper>> = (args) => (
  <SlotMapper {...args} />
);

export const Default = Template.bind({});
Default.args = {
  initialInputLabware: labwareFactory.buildList(
    3,
    {
      slots: sampleSize(
        Array.from(genAddresses({ numRows: 4, numColumns: 2 })),
        5
      ).map((address) => slotFactory.build({ address })),
    },
    {
      associations: {
        labwareType: labwareTypes[LabwareTypeName.VISIUM_TO].build(),
      },
    }
  ),
  initialOutputLabware: labwareFactory.buildList(1, undefined, {
    associations: {
      labwareType: labwareTypes[LabwareTypeName.PLATE].build(),
    },
  }),
};
