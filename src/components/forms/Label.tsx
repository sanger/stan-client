import React from 'react';
import classNames from 'classnames';
import Pill from '../Pill';
import Information from '../notifications/Information';

interface LabelProps extends React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
  name: string;
  displayTag?: string;
  info?: React.ReactNode;
}

const Label = ({ name, displayTag, info, children, className, ...rest }: LabelProps) => {
  const labelClassName = classNames('block', className);

  return (
    <label {...rest} className={labelClassName}>
      <span className="text-gray-800 mr-3 flex flex-row gap-x-1">
        {name}
        {info && <Information>{info}</Information>}
      </span>
      {displayTag && <Pill color={'pink'}>{displayTag}</Pill>}
      {children}
    </label>
  );
};

export default Label;
