import React from 'react';

export interface ZoomIconProps extends React.SVGProps<SVGSVGElement> {
  onClick?: () => void;
  disabled?: boolean;
}

export const ZoomInIcon = ({ disabled, onClick }: ZoomIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="35"
      viewBox="0 -960 960 960"
      width="35"
      className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      onClick={!disabled ? onClick : undefined}
      data-testid="zoom-in-icon"
    >
      <path d="M783.282-154 529.077-408.205q-29.798 26.398-69.174 40.456-39.376 14.057-79.185 14.057-95.757 0-162.084-66.196-66.327-66.195-66.327-161.525 0-95.331 66.196-161.651 66.195-66.321 161.486-66.321 95.29 0 161.907 66.232t66.617 161.529q0 41.368-14.769 80.778-14.77 39.41-40.411 68.384l254.36 253.539L783.282-154ZM380.564-387.538q81.645 0 137.874-56.09t56.229-137.911q0-81.82-56.229-137.91t-137.874-56.09q-81.773 0-138.092 56.09-56.318 56.09-56.318 137.91 0 81.821 56.318 137.911 56.319 56.09 138.092 56.09Zm-17.077-101.283v-76.205h-76.205v-33.846h76.205v-75.538h33.846v75.538h75.539v33.846h-75.539v76.205h-33.846Z" />
    </svg>
  );
};
