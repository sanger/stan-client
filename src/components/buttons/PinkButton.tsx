import React from "react";
import Button, { ButtonProps } from "./Button";
import classNames from "classnames";

interface PinkButtonProps extends ButtonProps {}

const PinkButton = ({
  children,
  className,
  action = "primary",
  ...rest
}: PinkButtonProps) => {
  const buttonClasses = classNames(
    {
      "text-white bg-sp hover:bg-sp-600 focus:border-sp-700 focus:shadow-outline-sp active:bg-sp-700":
        action === "primary",
      "text-sp bg-transparent border border-sp hover:bg-sp-100 focus:border-sp-400 focus:shadow-outline-sp active:bg-sp-200":
        action === "secondary",
      "text-sp bg-transparent hover:text-sp-700 active:text-sp-800":
        action === "tertiary",
    },
    className
  );

  return (
    <Button {...rest} className={buttonClasses}>
      {children}
    </Button>
  );
};

export default PinkButton;
