import React from "react";
import classNames from "classnames";
import Pill from "../Pill";

interface LabelProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  name: string;
  displayTag?: string;
}

const Label = ({
  name,
  displayTag,
  children,
  className,
  ...rest
}: LabelProps) => {
  const labelClassName = classNames("block", className);

  return (
    <label {...rest} className={labelClassName}>
      <span className="text-gray-800 mr-3">{name}</span>
      {displayTag && <Pill color={"pink"}>{displayTag}</Pill>}
      {children}
    </label>
  );
};

export default Label;
