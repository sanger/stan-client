import React from "react";
import classNames from "classnames";

interface PillProps {
  color: "pink";
  children: React.ReactNode;
}

const Pill = ({ color, children }: PillProps) => {
  const spanClassName = classNames(
    {
      "bg-sp text-gray-100": color === "pink",
    },
    "px-2 rounded-full flex items-center justify-center font-semibold text-sm"
  );

  return <span className={spanClassName}>{children}</span>;
};

export default Pill;
