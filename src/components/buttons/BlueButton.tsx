import React from "react";
import Button, { ButtonProps } from "./Button";
import classNames from "classnames";

interface BlueButtonProps extends ButtonProps {
  action?: "primary" | "secondary" | "tertiary";
}

const BlueButton = ({
  children,
  className,
  action = "primary",
  ...rest
}: BlueButtonProps) => {
  const buttonClasses = classNames(
    {
      "text-white bg-sdb-400 hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600":
        action == "primary",
      "text-sdb-400 border border-sdb-400 bg-white hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":
        action == "secondary",
      "text-sdb-400 underline bg-white hover:bg-gray-100 focus:border-sdb-400 focus:shadow-outline-sdb active:bg-gray-200":
        action == "tertiary",
    },
    className
  );

  return (
    <Button {...rest} className={buttonClasses}>
      {children}
    </Button>
  );
};

export default BlueButton;
