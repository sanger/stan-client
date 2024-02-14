import React from 'react';
import AddIcon from '../icons/AddIcon';

const AddButton = (
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      className={
        `p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-gray-400
      hover:text-gray-600 disabled:text-gray-200 ` + props.className ?? ''
      }
    >
      <AddIcon className="inline-block h-5 w-5" />
    </button>
  );
};

export default AddButton;
