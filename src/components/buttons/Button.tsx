import React from "react";
import classNames from "classnames";
import LoadingSpinner from "../icons/LoadingSpinner";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  loading?: boolean;
  action?: "primary" | "secondary" | "tertiary";
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
    "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm",
    {
      "cursor-not-allowed opacity-50": disabled || loading,
    },
    className
  );

  return (
    <button {...rest} disabled={disabled} className={buttonClasses}>
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
