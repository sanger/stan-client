import { Navigate, Outlet, Route, RouteProps, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import { UserRole } from '../types/sdk';

type AuthWrapperProps = {
  /**
   * If defined, this is the minimum role a user must be to access the route
   */
  role?: UserRole;
};
const AuthLayout = ({ role = UserRole.Normal }: AuthWrapperProps) => {
  const location = useLocation();
  const auth = useAuth();
  if (auth.isAuthenticated() && auth.userRoleIncludes(role)) {
    return <Outlet />;
  } else {
    if (!auth.isAuthenticated()) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location, message: `Please sign in to access ${location.pathname}` }}
        />
      );
    } else {
      return (
        <Navigate
          to="/"
          replace
          state={{ from: location, message: `You are not authorised to access ${location.pathname}` }}
        />
      );
    }
  }
};

export default AuthLayout;
