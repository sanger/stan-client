import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import SlotMapper from './SlotMapper';
import labwareFactory, { plateFactory } from '../../lib/factories/labwareFactory';
import { labwareTypes } from '../../lib/factories/labwareTypeFactory';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../types/stan';
import { LabwareFlagged } from '../../types/sdk';

const meta: Meta = {
  title: 'Slot Mapper',
  component: SlotMapper
};

export default meta;

const Template: Story<ComponentProps<typeof SlotMapper>> = (args) => <SlotMapper {...args} />;

export const Default = Template.bind({});
Default.args = {
  initialInputLabware: labwareFactory.buildList(3, undefined, {
    associations: {
      labwareType: labwareTypes[LabwareTypeName.VISIUM_LP].build()
    }
  }) as Array<LabwareFlagged>,
  initialOutputLabware: [{ labware: plateFactory.build() as NewFlaggedLabwareLayout, slotCopyContent: [] }]
};
