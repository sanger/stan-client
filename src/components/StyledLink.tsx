import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import classNames from 'classnames';

type StyledLinkProps = LinkProps & React.RefAttributes<HTMLAnchorElement>;

const StyledLink: React.FC<StyledLinkProps> = ({ children, className, ...rest }) => {
  const linkClassName = classNames(
    'text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide',
    className
  );
  return (
    <Link className={linkClassName} {...rest}>
      {children}
    </Link>
  );
};

export default StyledLink;
