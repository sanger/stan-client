import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import LoadingSpinner from "../pages/LoadingSpinner";
import Login from "../pages/Login";
import { getRegistrationMachine } from "../lib/services/registrationService";
import { getSectioningMachine } from "../lib/services/sectioningService";
import Presenter from "./Presenter";
import {
  buildRegistrationPresentationModel,
  buildReleasePresentationModel,
  buildSectioningModel,
} from "../lib/factories/presentationModelFactory";

const Logout = React.lazy(() => import("../pages/Logout"));
const Lab = React.lazy(() => import("../pages/Lab"));
const Reports = React.lazy(() => import("../pages/Reports"));
const Admin = React.lazy(() => import("../pages/Admin"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Registration = React.lazy(() => import("../pages/Registration"));
const Sectioning = React.lazy(() => import("../pages/Sectioning"));
const Release = React.lazy(() => import("../pages/Release"));

export function Routes() {
  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/logout">
          <Logout />
        </Route>
        <Route exact path="/lab">
          <Lab />
        </Route>
        <AuthenticatedRoute path="/lab/sectioning">
          <Presenter
            machine={getSectioningMachine}
            model={buildSectioningModel}
          >
            {(presentationModel) => <Sectioning model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>
        <Route path="/reports">
          <Reports />
        </Route>
        <AuthenticatedRoute exact path="/admin">
          <Admin />
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/admin/registration">
          <Presenter
            machine={getRegistrationMachine}
            model={buildRegistrationPresentationModel}
          >
            {(presentationModel) => <Registration model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>
        <Route exact path="/">
          <Dashboard />
        </Route>
        <Route path="/login" component={Login} />
        <Route path="/release">
          <Presenter
            machine={getRegistrationMachine}
            model={buildReleasePresentationModel}
          >
            {(presentationModel) => <Release model={presentationModel} />}
          </Presenter>
        </Route>
      </Switch>
    </React.Suspense>
  );
}
