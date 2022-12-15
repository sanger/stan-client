import React, { ComponentProps } from 'react';
import { Story, Meta } from '@storybook/react';
import { MultiSelect } from './MultiSelect';

const meta: Meta = {
  title: 'Multi Select Dropdown',
  component: MultiSelect
};
export default meta;

const Template: Story<ComponentProps<typeof MultiSelect>> = ({ children, ...args }) => <MultiSelect {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  options: ['Option 1', 'Option 2', 'Option 3'].map((option) => {
    return {
      label: option,
      key: option,
      value: option
    };
  })
};
