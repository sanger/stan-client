import React from 'react';

interface FileIconProps extends React.SVGProps<SVGSVGElement> {}

const FileIcon: React.FC<FileIconProps> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="currentColor" {...props}>
      <path d="M8 18.025h8v-2.1H8Zm0-4h8v-2.1H8ZM3.8 22.2V1.8h10.275L20.2 7.925V22.2Zm9.125-13.125v-5h-6.85v15.85h11.85V9.075Zm-6.85-5v5-5 15.85Z" />
    </svg>
  );
};

export default FileIcon;
