import React from 'react';

interface CircleProps {
  backgroundColor: string;
}

const Circle: React.FC<CircleProps> = ({ backgroundColor }) => {
  return <span className={`inline-block h-8 w-8 rounded-full ${backgroundColor}`} />;
};

export default Circle;
