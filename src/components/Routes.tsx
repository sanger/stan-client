import React, { useContext, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Location from "../pages/Location";
import Sectioning from "../pages/sectioning/Sectioning";
import Extraction from "../pages/Extraction";
import Registration from "../pages/Registration";
import Release from "../pages/Release";
import Store from "../pages/Store";
import Search from "../pages/Search";
import Destroy from "../pages/Destroy";
import SlideRegistration from "../pages/SlideRegistration";
import SlotCopy from "../pages/SlotCopy";
import { plateFactory } from "../lib/factories/labwareFactory";
import DataFetcher from "./DataFetcher";
import { safeParseQueryString } from "../lib/helpers";
import { isLocationSearch, LocationSearchParams } from "../types/stan";
import { Maybe, UserRole } from "../types/sdk";
import Configuration from "../pages/Configuration";
import { StanCoreContext } from "../lib/sdk";
import LabwareDetails from "../pages/LabwareDetails";

export function Routes() {
  const stanCore = useContext(StanCoreContext);

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

      <AuthenticatedRoute
        path="/lab/sectioning"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetSectioningInfo}
          >
            {(sectioningInfo) => <Sectioning sectioningInfo={sectioningInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/extraction"
        render={(routerProps) => <Extraction key={routerProps.location.key} />}
      />

      <AuthenticatedRoute
        path="/lab/visium_cdna"
        render={(routeProps) => (
          <SlotCopy
            key={routeProps.location.key}
            title={"Visium cDNA"}
            initialOutputLabware={[plateFactory.build()]}
          />
        )}
      />

      <AuthenticatedRoute
        path="/admin/registration"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetRegistrationInfo}
          >
            {(registrationInfo) => (
              <Registration registrationInfo={registrationInfo} />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/slide_registration"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetRegistrationInfo}
          >
            {(registrationInfo) => (
              <SlideRegistration
                registrationInfo={registrationInfo}
                {...routeProps}
              />
            )}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/admin/release"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetReleaseInfo}
          >
            {(releaseInfo) => <Release releaseInfo={releaseInfo} />}
          </DataFetcher>
        )}
      />

      <Route
        path="/locations/:locationBarcode"
        render={(routeProps) => {
          let locationSearch: Maybe<LocationSearchParams> = null;

          return (
            <DataFetcher
              key={routeProps.location.key}
              dataFetcher={() => {
                if (routeProps.location.search) {
                  locationSearch = safeParseQueryString<LocationSearchParams>(
                    routeProps.location.search,
                    isLocationSearch
                  );
                }

                return stanCore
                  .FindLocationByBarcode({
                    barcode: routeProps.match.params.locationBarcode,
                  })
                  .then((res) => res.location);
              }}
            >
              {(location) => (
                <Location
                  storageLocation={location}
                  locationSearchParams={locationSearch}
                  {...routeProps}
                />
              )}
            </DataFetcher>
          );
        }}
      />

      <Route path="/locations" component={Store} />
      <Route path="/store" component={Store} />
      <Route path="/login" component={Login} />

      <AuthenticatedRoute
        path="/admin/destroy"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={stanCore.GetDestroyInfo}
          >
            {(destroyInfo) => <Destroy destroyInfo={destroyInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/config"
        role={UserRole.Admin}
        render={() => (
          <DataFetcher dataFetcher={stanCore.GetConfiguration}>
            {(configuration) => <Configuration configuration={configuration} />}
          </DataFetcher>
        )}
      />

      <Route
        path="/labware/:barcode"
        render={(routeProps) => {
          return (
            <DataFetcher
              key={routeProps.location.key}
              dataFetcher={() => {
                return stanCore.FindLabware({
                  barcode: routeProps.match.params.barcode,
                });
              }}
            >
              {(findLabwareQuery) => (
                <LabwareDetails labware={findLabwareQuery.labware} />
              )}
            </DataFetcher>
          );
        }}
      />

      <Route
        path={["/", "/search"]}
        render={(routeProps) => {
          return (
            <DataFetcher dataFetcher={stanCore.GetSearchInfo}>
              {(searchInfo) => (
                <Search
                  searchInfo={searchInfo}
                  urlParamsString={routeProps.location.search}
                />
              )}
            </DataFetcher>
          );
        }}
      />
    </Switch>
  );
}
