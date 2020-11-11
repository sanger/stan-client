import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Lab from "../pages/Lab";
import Reports from "../pages/Reports";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Admin from "../pages/Admin";
import Dashboard from "../pages/Dashboard";
import Registration from "../pages/Registration";

export function Routes() {
  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    <Switch>
      <Route path="/logout">
        <Logout />
      </Route>
      <Route path="/lab">
        <Lab />
      </Route>
      <Route path="/reports">
        <Reports />
      </Route>
      <AuthenticatedRoute exact path="/admin">
        <Admin />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/admin/registration">
        <Registration />
      </AuthenticatedRoute>
      <Route exact path="/">
        <Dashboard />
      </Route>
      <Route path="/login" component={Login} />
    </Switch>
  );
}
