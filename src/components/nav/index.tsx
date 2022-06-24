import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import classNames from "classnames";

interface StanNavLinkProps extends NavLinkProps {}
const active = "text-white bg-gray-900";
const StanNavLink = ({ children, ...rest }: StanNavLinkProps) => {
  const defaultClass =
    "px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700";
  return (
    <NavLink
      className={(navData) =>
        navData.isActive ? classNames(defaultClass, active) : defaultClass
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};

interface StanMobileNavLinkProps extends NavLinkProps {}

const StanMobileNavLink = ({ children, ...rest }: StanMobileNavLinkProps) => {
  const defaultClass =
    "block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:text-white focus:bg-gray-700 text-gray-100 hover:text-white hover:bg-gray-700";
  return (
    <NavLink
      className={(navData) =>
        navData.isActive ? classNames(defaultClass, active) : defaultClass
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};

export { StanNavLink, StanMobileNavLink };
