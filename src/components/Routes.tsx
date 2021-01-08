import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Loading from "../pages/Loading";
import Login from "../pages/Login";
import { getRegistrationMachine } from "../lib/services/registrationService";
import { getSectioningMachine } from "../lib/services/sectioningService";
import Presenter from "./Presenter";
import {
  buildLocationPresentationModel,
  buildRegistrationPresentationModel,
  buildSectioningModel,
} from "../lib/factories/presentationModelFactory";
import { getLocationMachine } from "../lib/services/locationService";
import LocationPresentationModel from "../lib/presentationModels/locationPresentationModel";

const Logout = React.lazy(() => import("../pages/Logout"));
const Lab = React.lazy(() => import("../pages/Lab"));
const Store = React.lazy(() => import("../pages/Store"));
const Admin = React.lazy(() => import("../pages/Admin"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Registration = React.lazy(() => import("../pages/Registration"));
const Sectioning = React.lazy(() => import("../pages/Sectioning"));
const Location = React.lazy(() => import("../pages/Location"));

export function Routes() {
  // Hook to remove any location state after it has been consumed for a component.
  // Turns state into "flashes"
  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    <React.Suspense fallback={<Loading />}>
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

        <Route
          path="/locations/:locationBarcode"
          render={(routeProps) => (
            <Presenter
              key={routeProps.location.key}
              machine={() => getLocationMachine(routeProps)}
              model={buildLocationPresentationModel}
            >
              {(presentationModel: LocationPresentationModel) => (
                <Location model={presentationModel} {...routeProps} />
              )}
            </Presenter>
          )}
        />

        <Route path="/locations" component={Store} />
        <Route path="/store" component={Store} />
        <Route path="/login" component={Login} />
      </Switch>
    </React.Suspense>
  );
}
