import React from "react";
import classNames from "classnames";

interface PillProps {
  color: "pink" | "blue";
  children: React.ReactNode;
}

const Pill = ({ color, children }: PillProps) => {
  const spanClassName = classNames(
    {
      "bg-sp text-gray-100": color === "pink",
      "bg-sdb-300 text-gray-100": color === "blue",
    },
    "px-2 rounded-full font-semibold text-sm"
  );

  return <span className={spanClassName}>{children}</span>;
};

export default Pill;
