import React from "react";
import classNames from "classnames";

interface LoadingSpinnerProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Renders a spinning h-5 by w-5 Sanger dark-blue loading icon. All classNames can be overridden.
 * @param className classeNames to merge with defaults for the svg icon
 * @constructor
 */
function LoadingSpinner({ className }: LoadingSpinnerProps) {
  const svgClasses = classNames(
    "animate-spin",
    { "h-5 w-5 text-sdb": !className },
    { [`${className}`]: !!className }
  );
  return (
    <svg
      className={svgClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default LoadingSpinner;
