import React, { useContext } from "react";
import { authContext } from "../context/AuthContext";

interface AuthProps {
  children: JSX.Element | JSX.Element[];
}

/**
 * Renders children if user is authenticated
 * @param children
 */
function Authenticated({ children }: AuthProps) {
  const auth = useContext(authContext);
  return <>{auth.isAuthenticated() && children}</>;
}

/**
 * Renders children if user is not authenticated
 * @param children
 */
function Unauthenticated({ children }: AuthProps) {
  const auth = useContext(authContext);
  return <>{!auth.isAuthenticated() && children}</>;
}

export { Authenticated, Unauthenticated };
