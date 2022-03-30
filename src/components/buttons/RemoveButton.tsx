import React from "react";
import RemoveIcon from "../icons/RemoveIcon";

interface RemoveButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const RemoveButton: React.FC<RemoveButtonProps> = (props) => {
  return (
    <button
      data-testid="removeButton"
      {...props}
      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-100 focus:outline-none focus:bg-red-100 text-red-400 hover:text-red-600 disabled:text-gray-200"
    >
      <RemoveIcon className="block h-5 w-5" />
    </button>
  );
};

export default RemoveButton;
