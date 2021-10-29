import React, { ComponentProps } from "react";
import { Meta, Story } from "@storybook/react";
import LabwareSlots from "./LabwareSlots";
import {
  slideFactory,
  tubeFactory,
  visiumTOFactory,
} from "../../lib/factories/labwareFactory";
import {
  emptySlotFactory,
  filledSlotFactory,
} from "../../lib/factories/slotFactory";
import { LabwareFieldsFragment } from "../../types/sdk";

const meta: Meta = {
  title: "LabwareSlots",
  component: LabwareSlots,
};
export default meta;
const Template: Story<ComponentProps<typeof LabwareSlots>> = (args) => (
  <LabwareSlots {...args} />
);

const fillSlots = (labware: LabwareFieldsFragment) => {
  // Include some empty, some filled, and a few with multiple samples in
  labware.slots = labware.slots.map((slot, i) => {
    if (i % 2 === 0) {
      return emptySlotFactory.build({ address: slot.address });
    } else {
      return filledSlotFactory.build({ address: slot.address });
    }
  });
};

export const TUBE = Template.bind({});
const tube = tubeFactory.build();
fillSlots(tube as LabwareFieldsFragment);

const slotBuilder = () => {
  return (
    <select>
      <option value="Fail">Fail</option>
      <option value="Success">Success</option>
    </select>
  );
};
TUBE.args = {
  labware: tube as LabwareFieldsFragment,
  slotBuilder: slotBuilder,
};

export const SLIDE = Template.bind({});
const slide = slideFactory.build();
fillSlots(slide as LabwareFieldsFragment);

SLIDE.args = {
  labware: slide as LabwareFieldsFragment,
  slotBuilder: slotBuilder,
};

export const VISIUMTO = Template.bind({});
const visiumTO = visiumTOFactory.build();
fillSlots(visiumTO as LabwareFieldsFragment);
VISIUMTO.args = {
  labware: visiumTO as LabwareFieldsFragment,
  slotBuilder: slotBuilder,
};
