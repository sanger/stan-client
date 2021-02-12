import React from "react";

interface CircleProps {
  backgroundColor: string;
}

const Circle: React.FC<CircleProps> = ({ backgroundColor }) => {
  return (
    <span
      style={{ backgroundColor }}
      className="inline-block h-8 w-8 rounded-full"
    />
  );
};

export default Circle;
