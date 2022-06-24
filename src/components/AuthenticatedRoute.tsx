import React from "react";
import { Navigate, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/sdk";

interface AuthenticatedRouteProps {
  /**
   * If defined, this is the minimum role a user must be to access the route
   */
  role?: UserRole;
  element: React.ReactNode;
  path: string;
}

/**
 * Special version of a react-router Route.
 * If the user is authenticated, acts like a route.
 * If the user is not authenticated, redirects them to the login page.
 */
function AuthenticatedRoute({ role, element, path }: AuthenticatedRouteProps) {
  const auth = useAuth();
  if (role) {
    if (auth.userRoleIncludes(role)) {
      return <Route path={path} element={element} />;
    } else {
      return (
        <Navigate
          to={"/"}
          state={{
            referrer: path,
            warning: `You are not authorised to access ${path}`,
          }}
          replace
        />
      );
    }
  } else if (auth.isAuthenticated()) {
    return <Route path={path} element={element} />;
  } else {
    return (
      <Navigate
        to={"/login"}
        state={{
          referrer: path,
          warning: `Please sign in to access ${path}`,
        }}
      />
    );
  }
}

export default AuthenticatedRoute;
