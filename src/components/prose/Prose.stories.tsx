import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import Prose from './Prose';

const meta: Meta = {
  title: 'Prose',
  component: Prose
};
export default meta;

const Template: Story<ComponentProps<typeof Prose>> = ({ children, ...args }) => <Prose {...args}>{children}</Prose>;

export const documentation = Template.bind({});
documentation.args = {
  children: (
    <>
      <h1>Documentation</h1>

      <p>This is how a paragraph looks.</p>

      <blockquote>Here's a very important quote!</blockquote>

      <p>This is what some code looks like out the box (No syntax highlighting though).</p>
      <pre>
        <code>[7, 30, 99].sort(); // [30, 7, 99]</code>
      </pre>
    </>
  )
};
