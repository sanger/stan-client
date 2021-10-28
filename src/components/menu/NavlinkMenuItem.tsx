import React from "react";
import { NavLink } from "react-router-dom";

interface NavlinkMenuItemProps {
  path: string;
  caption: string;
  icon?: React.ReactNode;
  description?: string;
}

const NavLinkMenuItem: React.FC<NavlinkMenuItemProps> = ({
  path,
  caption,
  icon,
  description,
}) => {
  const IconComponent = () => {
    return <>{icon}</>;
  };
  return (
    <NavLink
      to={path}
      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
    >
      {icon && <IconComponent />}
      <div className="ml-4">
        <p className="text-base font-medium text-gray-900">{caption}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </NavLink>
  );
};

export default NavLinkMenuItem;
