import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Loading from "../pages/Loading";
import Login from "../pages/Login";
import { getRegistrationMachine } from "../lib/services/registrationService";
import { getSectioningMachine } from "../lib/services/sectioningService";
import Presenter from "./Presenter";
import {
  buildExtractionPresentationModel,
  buildLocationPresentationModel,
  buildRegistrationPresentationModel,
  buildReleasePresentationModel,
  buildSearchPresentationModel,
  buildSectioningModel,
} from "../lib/factories/presentationModelFactory";
import { getLocationMachine } from "../lib/services/locationService";
import LocationPresentationModel from "../lib/presentationModels/locationPresentationModel";
import { getReleaseMachine } from "../lib/services/releaseService";
import { getExtractionMachine } from "../lib/services/extractionService";
import { getSearchMachine } from "../lib/services/searchService";

const Logout = React.lazy(() => import("../pages/Logout"));

// Admin
const Registration = React.lazy(() => import("../pages/Registration"));
const Release = React.lazy(() => import("../pages/Release"));

// Lab
const Sectioning = React.lazy(() => import("../pages/Sectioning"));
const Extraction = React.lazy(() => import("../pages/Extraction"));

// Storage
const Store = React.lazy(() => import("../pages/Store"));
const Location = React.lazy(() => import("../pages/Location"));

const Search = React.lazy(() => import("../pages/Search"));

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

        <AuthenticatedRoute path="/lab/sectioning">
          <Presenter
            machine={getSectioningMachine}
            model={buildSectioningModel}
          >
            {(presentationModel) => <Sectioning model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>

        <AuthenticatedRoute path="/lab/extraction">
          <Presenter
            machine={getExtractionMachine}
            model={buildExtractionPresentationModel}
          >
            {(presentationModel) => <Extraction model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>

        <AuthenticatedRoute path="/admin/registration">
          <Presenter
            machine={getRegistrationMachine}
            model={buildRegistrationPresentationModel}
          >
            {(presentationModel) => <Registration model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/admin/release">
          <Presenter
            machine={getReleaseMachine}
            model={buildReleasePresentationModel}
          >
            {(presentationModel) => <Release model={presentationModel} />}
          </Presenter>
        </AuthenticatedRoute>

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

        <Route
          path={["/", "/search"]}
          render={(routeProps) => (
            <Presenter
              machine={() => getSearchMachine(routeProps)}
              model={buildSearchPresentationModel}
            >
              {(model) => <Search model={model} />}
            </Presenter>
          )}
        />
      </Switch>
    </React.Suspense>
  );
}
