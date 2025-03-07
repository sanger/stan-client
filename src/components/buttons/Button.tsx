import React from 'react';
import classNames from 'classnames';
import LoadingSpinner from '../icons/LoadingSpinner';

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  loading?: boolean;
  action?: 'primary' | 'secondary' | 'tertiary';
  miniButton?: boolean;
}

/**
 * Not to be used in the UI. Here to provide some good defaults for building other buttons.
 */
const Button = ({ children, disabled, className, loading, miniButton, ...rest }: ButtonProps) => {
  const width = miniButton ? 'w-20' : 'xs:mt-0 xs:w-auto';
  const buttonClasses = classNames(
    `sm:text-sm inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2`,
    {
      'cursor-not-allowed opacity-50': disabled || loading
    },
    className,
    width
  );

  return (
    <button {...rest} disabled={disabled} className={buttonClasses}>
      {children}
      {loading && (
        <span className="ml-3 -mr-1">
          <LoadingSpinner />
        </span>
      )}
    </button>
  );
};

export default Button;
