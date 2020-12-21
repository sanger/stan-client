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
  > {
  message?: string;
}

/**
 * SectioningDone notification component.
 */
const Success = ({
  message,
  children,
  className,
  ...rest
}: SuccessProps): JSX.Element => {
  const sectionClasses = classNames(
    "flex flex-row items-start justify-between border-l-4 border-green-600 p-2 bg-green-100 text-green-800",
    className
  );
  return (
    <section {...rest} className={sectionClasses}>
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
      <div className="ml-2 flex-grow">
        <p>{message}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </section>
  );
};

export default Success;
