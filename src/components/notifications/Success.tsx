import React from "react";
import classNames from "classnames";

/**
 * @property text Message to display in the notification
 * @property className (optional) classNames to merge into default classNames
 */
interface SuccessProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {}

/**
 * Success notification component.
 */
const Success = ({
  children,
  className,
  ...rest
}: SuccessProps): JSX.Element => {
  const sectionClasses = classNames(
    "text-center p-2 border-l-4 border-green-600 bg-green-100 text-green-800",
    className
  );
  return (
    <section {...rest} className={sectionClasses}>
      <p className="flex justify-start items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-2">{children}</span>
      </p>
    </section>
  );
};

export default Success;
