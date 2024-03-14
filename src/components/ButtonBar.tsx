import React, { ReactNode } from 'react';

type ButtonBarProps = {
  children: ReactNode;
  className?: string;
};
const ButtonBar = ({ children, className }: ButtonBarProps) => {
  return (
    <div className="border border-t-2 border-gray-200 w-full py-4 px-4 bg-gray-100 flex-shrink-0">
      <div className="mx-auto">
        <div className={className ? className : 'flex flex-row items-center justify-end space-x-2'}>{children}</div>
      </div>
    </div>
  );
};

export default ButtonBar;
