import React from 'react';
import classNames from 'classnames';

type PillProps = {
  color: 'pink' | 'blue';
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
};

const Pill = ({ color, children, className, dataTestId }: PillProps) => {
  const spanClassName = classNames(
    {
      'bg-sp text-gray-100': color === 'pink',
      'bg-sdb-300 text-gray-100': color === 'blue'
    },
    'px-2 rounded-full font-semibold text-sm',
    className
  );

  return (
    <span className={spanClassName} data-testid={dataTestId}>
      {children}
    </span>
  );
};

export default Pill;
