import React from 'react';
interface FlagIconProps extends React.SVGProps<SVGSVGElement> {}
const FlagIcon: React.FC<FlagIconProps> = (props) => {
  return (
    <svg
      data-testid="flag-icon"
      xmlns="http://www.w3.org/2000/svg"
      height={`${props.height ?? '24px'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-5 h-5 ` + props.className ?? ''}
      {...props}
    >
      <path d="M0 0h24v24H0V0z" fill="none" clipRule="evenodd" />
      <path d="M12.36 6l.4 2H18v6h-3.36l-.4-2H7V6h5.36M14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6L14 4z" clipRule="evenodd" />
    </svg>
  );
};

export default FlagIcon;
