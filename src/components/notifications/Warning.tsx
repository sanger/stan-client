import React from "react";
import classNames from "classnames";
import { ApolloError } from "@apollo/client";
import { Maybe } from "../../types/graphql";
import { extractServerErrors, ServerErrors } from "../../types/stan";

interface WarningProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  message?: string;
  error?: Maybe<ApolloError>;
}

const Warning = ({
  message,
  error,
  children,
  className,
  ...rest
}: WarningProps): JSX.Element => {
  const sectionClasses = classNames(
    "flex flex-row items-start justify-between border-l-4 border-orange-600 p-2 bg-orange-200 text-orange-800",
    className
  );
  let serverErrors: ServerErrors | undefined;
  if (error) {
    serverErrors = extractServerErrors(error);
  }
  return (
    <section {...rest} className={sectionClasses}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div className="ml-2 flex-grow">
        <p className="font-medium">{message}</p>

        {serverErrors?.message && (
          <p className="mt-2">{serverErrors.message}</p>
        )}

        {serverErrors?.problems && (
          <div className="mt-2">
            {
              <ul className="list-disc list-inside">
                {serverErrors.problems.map((problem, index) => {
                  return <li key={index}>{problem}</li>;
                })}
              </ul>
            }
          </div>
        )}

        {children && <div className="mt-2">{children}</div>}
      </div>
    </section>
  );
};

export default Warning;
