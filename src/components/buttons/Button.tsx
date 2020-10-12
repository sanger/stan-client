import React from "react";
import classNames from "classnames";
import LoadingSpinner from "../LoadingSpinner";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  loading?: boolean;
}

/**
 * Not to be used in the UI. Here to provide some good defaults for building other buttons.
 */
const Button = ({
  children,
  disabled,
  className,
  loading,
  ...rest
}: ButtonProps) => {
  const buttonClasses = classNames(
    "group relative flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md focus:outline-none transition duration-150 ease-in-out",
    {
      "cursor-not-allowed opacity-50": disabled || loading,
    },
    className
  );

  return (
    <button {...rest} className={buttonClasses}>
      {children}
      {loading && (
        <span className="absolute right-0 inset-y-0 flex items-center pr-3">
          <LoadingSpinner />
        </span>
      )}
    </button>
  );
};

export default Button;
