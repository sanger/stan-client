import React from 'react';

/**
 * CopySVG icon
 * @param props SVGProps passed on to the icon
 */
const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      data-testid="copy-icon"
      id="copy-icon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      height="20"
      width="20"
      stroke="currentColor"
      {...props}
    >
      <path d="M4.5 18q-.625 0-1.062-.438Q3 17.125 3 16.5V5h1.5v11.5H14V18Zm3-3q-.625 0-1.062-.438Q6 14.125 6 13.5v-10q0-.625.438-1.062Q6.875 2 7.5 2h8q.625 0 1.062.438Q17 2.875 17 3.5v10q0 .625-.438 1.062Q16.125 15 15.5 15Zm0-1.5h8v-10h-8v10Zm0 0v-10 10Z" />
    </svg>
  );
};

export default CopyIcon;
