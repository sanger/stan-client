import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch, Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lab from "./pages/Lab";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Cookies from "js-cookie";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

const httpLink = createHttpLink({
  credentials: "same-origin",
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
    },
  };
});

const errorLink = onError(({ operation, networkError }) => {
  if (
    networkError &&
    "statusCode" in networkError &&
    networkError.statusCode === 403
  ) {
    // Ignore if the CurrentUser query returns a 403. It means we're not logged in.
    if (operation.operationName !== "CurrentUser") {
      history.replace({
        pathname: "/login",
        state: {
          warning: "Please log in to continue.",
          loggedOut: true,
          referrer: history.location.pathname,
        },
      });
    }
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, errorLink, httpLink]),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router history={history}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
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
