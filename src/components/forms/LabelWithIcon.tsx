import React from "react";

interface LabelWithIconProps
  extends React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const LabelWithIcon = ({
  name,
  children,
  Icon,
  ...rest
}: LabelWithIconProps) => {
  return (
    <label {...rest} className="block">
      <span className="text-gray-800">{name}</span>
      <div className="flex w-full md:w-2/3 rounded-md shadow-s">
        <span className="inline-flex items-center px-1 rounded-l-md border border-r-0">
          <Icon className="p-1 h-8 w-8" />
        </span>
        {children}
      </div>
    </label>
  );
};

export default LabelWithIcon;
