import React from "react";

const ButtonBar: React.FC = ({ children }) => {
  return (
    <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-row items-center justify-end space-x-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ButtonBar;
