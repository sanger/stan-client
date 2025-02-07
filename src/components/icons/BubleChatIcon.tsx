import React from 'react';

const BubleChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      data-testid="buble-chat-icon"
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 -960 960 960"
      width="20px"
      fill="currentColor"
      className={`w-5 h-5 ${props.className}`}
      {...props}
    >
      <path d="M250-394h316v-52H250v52Zm0-132h460v-52H250v52Zm0-132h460v-52H250v52ZM116-134.46v-645.23q0-27.01 18.65-45.66Q153.3-844 180.31-844h599.38q27.01 0 45.66 18.65Q844-806.7 844-779.69v455.38q0 27.01-18.65 45.66Q806.7-260 779.69-260H241.54L116-134.46ZM220-312h559.69q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H180.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v520.08L220-312Zm-52 0v-480 480Z" />
    </svg>
  );
};

export default BubleChatIcon;
