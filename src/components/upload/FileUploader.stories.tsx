import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import FileUploader from './FileUploader';

const meta: Meta = {
  title: 'File Uploader',
  component: FileUploader
};

export default meta;

const Template: Story<ComponentProps<typeof FileUploader>> = (args) => <FileUploader {...args} />;

export const Default = Template.bind({});
Default.args = {};
