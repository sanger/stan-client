import React from "react";
import logo from "../images/logo.svg";
import classNames from "classnames";

interface LogoProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {}

/**
 * Stan logo. Defaults to h-8 w-8.
 * @param className
 * @constructor
 */
const Logo = ({ className, ...rest }: LogoProps) => {
  const imgClassName = classNames("h-8 w-8", className);
  return <img {...rest} className={imgClassName} src={logo} alt="STAN logo" />;
};

export default Logo;
