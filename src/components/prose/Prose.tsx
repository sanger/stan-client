import React from "react";

interface ProseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {}

/**
 * A component that will style all child HTML elements using Tailwind's Typography plugin
 * @see {@link https://github.com/tailwindlabs/tailwindcss-typography}
 */
const Prose: React.FC<ProseProps> = ({ children, className, ...rest }) => {
  return (
    <article
      className={`prose prose-sm lg:prose-lg xl:prose-xl ${className}`}
      {...rest}
    >
      {children}
    </article>
  );
};

export default Prose;
