import React from "react";

interface RemoveButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const IconButton: React.FC<RemoveButtonProps> = ({ children, ...rest }) => {
  return (
    <button
      {...rest}
      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-gray-400 hover:text-gray-600"
    >
      {children}
    </button>
  );
};

export default IconButton;
