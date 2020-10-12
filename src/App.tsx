import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lab from "./pages/Lab";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import { useMinimumWait } from "./hooks";
import Loading from "./pages/Loading";
import Logout from "./pages/Logout";

function App() {
  const waitElapsed = useMinimumWait(1500);
  if (!waitElapsed) return <Loading />;

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

interface AuthenticatedRouteProps extends RouteProps {}

function AuthenticatedRoute({ children, ...rest }: AuthenticatedRouteProps) {
  const authContext = useContext(AuthContext);

  if (authContext.isAuthenticated()) {
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

function AppRoutes() {
  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/logout">
        <Logout />
      </Route>
      <Route path="/lab">
        <Lab />
      </Route>
      <Route path="/reports">
        <Reports />
      </Route>
      <AuthenticatedRoute path="/admin">
        <Admin />
      </AuthenticatedRoute>
      <Route exact path="/">
        <Dashboard />
      </Route>
    </Switch>
  );
}

export default App;
