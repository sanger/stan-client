import React from 'react';
import { UserRole } from '../types/sdk';
import { useAuth } from '../context/AuthContext';

interface AuthProps {
  role?: UserRole;
  children: React.ReactNode | React.ReactNode[];
}

/**
 * Renders children if user is authenticated
 * @param children
 * @param role
 */
function Authenticated({ children, role = UserRole.Normal }: AuthProps) {
  const auth = useAuth();
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
  const auth = useAuth();
  return <>{!auth.isAuthenticated() && children}</>;
}

export { Authenticated, Unauthenticated };
