import React, { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { authContext } from "../context/AuthContext";

interface AuthenticatedRouteProps extends RouteProps {}

/**
 * Special version of a react-router Route.
 * If the user is authenticated, acts like a route.
 * If the user is not authenticated, redirects them to the login page.
 */
function AuthenticatedRoute({ children, ...rest }: AuthenticatedRouteProps) {
  const auth = useContext(authContext);

  if (auth.isAuthenticated()) {
    return <Route {...rest}>{children}</Route>;
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
