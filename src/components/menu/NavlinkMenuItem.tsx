import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavlinkMenuItemProps {
  path: string;
  caption: string;
  icon?: React.ReactNode;
  description?: string;
  isDisabled?: boolean;
}

const NavLinkMenuItem: React.FC<NavlinkMenuItemProps> = ({ path, caption, icon, description, isDisabled }) => {
  const IconComponent = () => {
    return <>{icon}</>;
  };
  if (isDisabled) {
    return (
      <div className="-m-3 p-3 flex items-start rounded-lg bg-gray-100 cursor-not-allowed">
        {icon && <IconComponent />}
        <div className="ml-4">
          <p className="text-base font-medium text-gray-600">{caption}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    );
  }
  return (
    <NavLink to={path} className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
      {icon && <IconComponent />}
      <div className="ml-4">
        <p className="text-base font-medium text-gray-900">{caption}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </NavLink>
  );
};

export default NavLinkMenuItem;
