import React from "react";
import classNames from "classnames";

interface GuestIconProps extends React.SVGProps<SVGSVGElement> {}

const GuestIcon = ({ className, ...rest }: GuestIconProps) => {
  const svgClasses = classNames("h-10 w-10 p-1", className);
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={svgClasses}
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default GuestIcon;
