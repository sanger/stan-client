import classNames from 'classnames';
import React from 'react';

interface IconButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  disabled?: boolean;
  dataTestId?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, disabled = false, dataTestId, ...rest }) => {
  const buttonClassNames = classNames(
    {
      'hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 hover:text-gray-600': !disabled,
      'cursor-not-allowed': disabled
    },
    'inline-flex items-center justify-center p-2 rounded-md text-gray-400'
  );

  return (
    <button {...rest} className={buttonClassNames} data-testid={dataTestId ?? ''}>
      {children}
    </button>
  );
};

export default IconButton;
