import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface AuthProps {
  children: JSX.Element | JSX.Element[];
}

/**
 * Renders children if user is authenticated
 * @param children
 */
function Authenticated({ children }: AuthProps) {
  const authContext = useContext(AuthContext);
  return <>{authContext.isAuthenticated() && children}</>;
}

/**
 * Renders children if user is not authenticated
 * @param children
 */
function Unauthenticated({ children }: AuthProps) {
  const authContext = useContext(AuthContext);
  return <>{!authContext.isAuthenticated() && children}</>;
}

export { Authenticated, Unauthenticated };
