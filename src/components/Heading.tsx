import React, { ElementType } from "react";
import classNames from "classnames";

interface HeadingProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  > {
  level: 1 | 2 | 3 | 4;
  showBorder?: boolean;
}

const Heading = ({
  children,
  level,
  className,
  showBorder = true,
}: HeadingProps) => {
  const HeadingTag = `h${level}` as ElementType;

  const headingClasses = classNames(
    {
      "text-3xl font-bold tracking-tight leading-loose": level === 1,
      "text-2xl font-bold tracking-tight leading-relaxed": level === 2,
      "text-xl font-bold tracking-tight leading-relaxed": level === 3,
      "text-lg font-medium tracking-tight leading-relaxed": level === 4,
      "border-b-2 border-sp": showBorder,
    },
    className
  );

  return <HeadingTag className={headingClasses}>{children}</HeadingTag>;
};

export default Heading;
