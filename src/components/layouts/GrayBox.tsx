import React from 'react';
import { FCWithChildren } from '../../types/stan';

/**
 * A layout for a big gray box that can have a sidebar
 */
const GrayBox: FCWithChildren = ({ children }) => {
  return (
    <div className="lg:w-5/6 mt-4 p-3 lg:pr-0 w-100 md:flex md:flex-row md:gap-4 md:justify-between bg-gray-100 rounded-md">
      {children}
    </div>
  );
};

export default GrayBox;

export const Sidebar: FCWithChildren = ({ children, ...rest }) => {
  return (
    <div
      className="md:w-1/3 mt-4 p-3 border-t-4 border-sp rounded-md lg:transform lg:translate-x-1/2 space-y-4 bg-sdb-400 text-gray-100"
      {...rest}
    >
      {children}
    </div>
  );
};
