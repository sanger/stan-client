import React from 'react';
import Button, { ButtonProps } from './Button';
import classNames from 'classnames';

interface WhiteButtonProps extends ButtonProps {}

const WhiteButton = ({ children, className, action = 'primary', ...rest }: WhiteButtonProps) => {
  const buttonClasses = classNames(
    {
      'text-gray-800 bg-white hover:bg-gray-200 shadow-sm focus:border-gray-200 focus:shadow-outline-gray-200 active:bg-gray-300':
        action === 'primary',
      'text-white border border-white bg-transparent shadow-sm hover:text-gray-100 focus:text-gray-400 focus:shadow-outline-gray-500 active:text-gray-200':
        action === 'secondary',
      'text-gray-100 bg-transparent hover:text-white active:text-gray-200': action === 'tertiary'
    },
    className
  );

  return (
    <Button {...rest} className={buttonClasses}>
      {children}
    </Button>
  );
};

export default WhiteButton;
