import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

interface StanNavLinkProps extends NavLinkProps {}
const StanNavLink = ({ children, ...rest }: StanNavLinkProps) => {
  return (
    <NavLink
      className={({ isActive }) =>
        'px-3 py-2 rounded-md text-sm font-medium focus:outline-hidden focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700' +
        (isActive ? ' text-white bg-gray-900' : '')
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};

interface StanMobileNavLinkProps extends NavLinkProps {
  isDisabled?: boolean;
  children: string;
}

const StanMobileNavLink = ({ children, isDisabled, ...rest }: StanMobileNavLinkProps) => {
  if (isDisabled) {
    return <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-500">{children}</div>;
  }
  return (
    <NavLink
      {...rest}
      className={({ isActive }) =>
        'block px-3 py-2 rounded-md text-base font-medium focus:outline-hidden focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700' +
        (isActive ? 'text-white bg-gray-900' : '')
      }
    >
      {children}
    </NavLink>
  );
};

export { StanNavLink, StanMobileNavLink };
