import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Login from "../pages/Login";
import { getRegistrationMachine } from "../lib/services/registrationService";
import { getSectioningMachine } from "../lib/services/sectioningService";
import Presenter from "./Presenter";
import {
  buildDestroyPresentationModel,
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
import { getDestroyMachine } from "../lib/services/destroyService";
import Logout from "../pages/Logout";
import Location from "../pages/Location";
import Sectioning from "../pages/Sectioning";
import Extraction from "../pages/Extraction";
import Registration from "../pages/Registration";
import Release from "../pages/Release";
import Store from "../pages/Store";
import Search from "../pages/Search";
import Destroy from "../pages/Destroy";

//HYGEN MARKER

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

      <AuthenticatedRoute path="/lab/sectioning">
        <Presenter machine={getSectioningMachine} model={buildSectioningModel}>
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

      <AuthenticatedRoute path="/admin/destroy">
        <Presenter
          machine={getDestroyMachine}
          model={buildDestroyPresentationModel}
        >
          {(model) => <Destroy model={model} />}
        </Presenter>
      </AuthenticatedRoute>

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
  );
}
