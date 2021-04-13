import React, { useContext } from "react";
import { authContext } from "../context/AuthContext";
import { UserRole } from "../types/sdk";

interface AuthProps {
  role?: UserRole;
  children: React.ReactNode | React.ReactNode[];
}

/**
 * Renders children if user is authenticated
 * @param children
 */
function Authenticated({ children, role }: AuthProps) {
  const auth = useContext(authContext);
  if (role) {
    return <>{auth.userRoleIncludes(role) && children}</>;
  }
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
