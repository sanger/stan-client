import React, { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { authContext } from "../context/AuthContext";
import { UserRole } from "../types/sdk";

interface AuthenticatedRouteProps extends RouteProps {
  /**
   * If defined, this is the minimum role a user must be to access the route
   */
  role?: UserRole;
}

/**
 * Special version of a react-router Route.
 * If the user is authenticated, acts like a route.
 * If the user is not authenticated, redirects them to the login page.
 */
function AuthenticatedRoute({
  render,
  role,
  ...rest
}: AuthenticatedRouteProps) {
  const auth = useContext(authContext);

  if (role) {
    if (auth.userRoleIncludes(role)) {
      return <Route render={render} {...rest} />;
    } else {
      return (
        <Route {...rest}>
          <Redirect
            to={{
              pathname: "/",
              state: {
                referrer: rest.location,
                warning: `You are not authorised to access ${rest.path}`,
              },
            }}
          />
        </Route>
      );
    }
  } else if (auth.isAuthenticated()) {
    return <Route render={render} {...rest} />;
  } else {
    return (
      <Route {...rest}>
        <Redirect
          to={{
            pathname: "/login",
            state: {
              referrer: rest.location,
              warning: `Please sign in to access ${rest.path}`,
            },
          }}
        />
      </Route>
    );
  }
}

export default AuthenticatedRoute;
