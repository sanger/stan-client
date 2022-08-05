import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import Pager from './Pager';
import { usePager } from '../../lib/hooks/usePager';

const meta: Meta = {
  title: 'Pager',
  component: Pager
};
export default meta;

export const WithUsePager: Story<ComponentProps<typeof Pager>> = () => {
  const pager = usePager({ initialCurrentPage: 1, initialNumberOfPages: 7 });

  return (
    <Pager
      currentPage={pager.currentPage}
      numberOfPages={pager.numberOfPages}
      pageDownDisabled={pager.pageDownDisabled}
      pageUpDisabled={pager.pageUpDisabled}
      onPageDownClick={pager.onPageDownClick}
      onPageUpClick={pager.onPageUpClick}
    />
  );
};
