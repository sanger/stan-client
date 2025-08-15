import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import * as slotHelper from '../../lib/helpers/slotHelper';

import Labware from './Labware';
import {
  plateFactory,
  superFrostPlusFactory,
  tubeFactory,
  visiumLPFactory,
  visiumTOFactory
} from '../../lib/factories/labwareFactory';
import { emptySlotFactory, filledSlotFactory } from '../../lib/factories/slotFactory';

const meta: Meta = {
  title: 'Labware',
  component: Labware
};
export default meta;

const Template: Story<ComponentProps<typeof Labware>> = (args) => <Labware {...args} />;

export const Plate = Template.bind({});

const plate = plateFactory.build();

// Include some empty, some filled, and a few with multiple samples in
plate.slots = plate.slots.map((slot, i) => {
  if (i % 2 === 0) {
    return emptySlotFactory.build({ address: slot.address });
  } else if (i % 19 === 0) {
    return filledSlotFactory.build({ address: slot.address }, { transient: { numberOfSamples: 2 } });
  } else {
    return filledSlotFactory.build({ address: slot.address });
  }
});

Plate.args = {
  labware: plate,
  slotColor: (address, slot) => {
    if (slotHelper.hasMultipleSamples(slot)) {
      return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500';
    } else if (slotHelper.isSlotFilled(slot)) {
      return 'bg-sdb-400';
    }
  }
};

export const VisiumLP = Template.bind({});
VisiumLP.args = {
  labware: visiumLPFactory.build()
};

export const TUBE = Template.bind({});
const tube = tubeFactory.build();

const slotBuilder = () => {
  return (
    <select>
      <option value="Fail">Fail</option>
      <option value="Success">Success</option>
    </select>
  );
};
TUBE.args = {
  labware: tube,
  slotBuilder: slotBuilder
};

export const SLIDE = Template.bind({});
const slide = superFrostPlusFactory.build();

SLIDE.args = {
  labware: slide,
  slotBuilder: slotBuilder
};

export const VISIUMTO = Template.bind({});
const visiumTO = visiumTOFactory.build();
VISIUMTO.args = {
  labware: visiumTO,
  slotBuilder: slotBuilder
};
