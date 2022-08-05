import React from 'react';
import classNames from 'classnames';
import LogoSVG from '../images/LogoSVG';

interface LogoProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {}

/**
 * Stan logo. Defaults to h-8 w-8.
 * @param className
 * @param rest
 * @constructor
 */
const Logo = ({ className }: LogoProps) => {
  const imgClassName = classNames('h-8 w-8', className);
  return <LogoSVG className={imgClassName} />;
};
export default Logo;
