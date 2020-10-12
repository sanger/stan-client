import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface StanNavLinkProps extends NavLinkProps {}
const StanNavLink = ({ children, ...rest }: StanNavLinkProps) => {
  return (
    <NavLink
      className="px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700"
      activeClassName="text-white bg-gray-900"
      {...rest}
    >
      {children}
    </NavLink>
  );
};

interface StanMobileNavLinkProps extends NavLinkProps {}

const StanMobileNavLink = ({ children, ...rest }: StanMobileNavLinkProps) => {
  return (
    <NavLink
      {...rest}
      className="block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700"
      activeClassName="text-white bg-gray-900"
    >
      {children}
    </NavLink>
  );
};

export { StanNavLink, StanMobileNavLink };
