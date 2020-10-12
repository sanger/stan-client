import React from "react";
import CSSTransition from "react-transition-group/CSSTransition";

/**
 * Renders a CSSTransition fade-in effect.
 * @param children Only one child
 */
const FadeInTransition = ({ children }: { children: JSX.Element }) => {
  return (
    <CSSTransition timeout={2500} appear={true} in={true} classNames="fade-in">
      {children}
    </CSSTransition>
  );
};

export default FadeInTransition;
