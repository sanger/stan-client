import React from "react";

interface BadgeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {}

const Badge = ({ children }: BadgeProps) => {
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sp-100 text-sp-800">
      {children}
    </span>
  );
};

export default Badge;
