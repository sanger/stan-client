import React from "react";

/**
 * @param direction Direction of the gradient
 * @param from Starting colour
 * @param to Finishing colour
 */
interface GradientBackgroundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  direction?: "to-tr" | "to-bl";
  from?: string;
  to?: string;
}

/**
 * Gradient Background component
 */
const GradientBackground = ({
  children,
  direction = "to-tr",
  from = "sdb",
  to = "sdb-400",
  ...rest
}: GradientBackgroundProps) => {
  return (
    <div className={`bg-gradient-${direction} from-${from} to-${to}`}>
      {children}
    </div>
  );
};

export default GradientBackground;
