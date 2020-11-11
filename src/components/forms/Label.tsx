import React from "react";
import classNames from "classnames";

interface LabelProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  name: string;
}

const Label = ({ name, children, className, ...rest }: LabelProps) => {
  const labelClassName = classNames("block", className);

  return (
    <label {...rest} className={labelClassName}>
      <span className="text-gray-800">{name}</span>
      {children}
    </label>
  );
};

export default Label;
