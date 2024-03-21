import React from 'react';
import classNames from 'classnames';

interface TextProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {}

/**
 * A paragraph of softer text
 */
const MutedText = ({ children, className, ...rest }: TextProps) => {
  const pClassNames = classNames('my-2 text-gray-700 lg:text-xs italic', className);

  return (
    <p className={pClassNames} {...rest}>
      {children}
    </p>
  );
};

export default MutedText;
