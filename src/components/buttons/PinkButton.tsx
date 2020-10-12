import React from "react";
import Button, { ButtonProps } from "./Button";
import classNames from "classnames";

interface PinkButtonProps extends ButtonProps {}

const PinkButton = ({ children, className, ...rest }: PinkButtonProps) => {
  const buttonClasses = classNames(
    "text-white bg-sp hover:bg-sp-600 focus:border-sp-700 focus:shadow-outline-sp active:bg-sp-700",
    className
  );

  return (
    <Button {...rest} className={buttonClasses}>
      {children}
    </Button>
  );
};

export default PinkButton;
