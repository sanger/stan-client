import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthenticatedRoute from "./AuthenticatedRoute";
import Login from "../pages/Login";
import { getRegistrationInfo } from "../lib/services/registrationService";
import { getSectioningInfo } from "../lib/services/sectioningService";
import { findLocationByBarcode } from "../lib/services/locationService";
import { getReleaseInfo } from "../lib/services/releaseService";
import { getSearchInfo } from "../lib/services/searchService";
import { getDestroyInfo } from "../lib/services/destroyService";
import Logout from "../pages/Logout";
import Location from "../pages/Location";
import Sectioning from "../pages/Sectioning";
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
import {
  cleanParams,
  parseQueryString,
  safeParseQueryString,
} from "../lib/helpers";
import { isLocationSearch, LocationSearchParams } from "../types/stan";
import { FindRequest, Maybe } from "../types/graphql";
import { ParsedQuery } from "query-string";
import _ from "lodash";

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

      <AuthenticatedRoute
        path="/lab/sectioning"
        render={(routeProps) => (
          <DataFetcher
            key={routeProps.location.key}
            dataFetcher={getSectioningInfo}
          >
            {(sectioningInfo) => <Sectioning sectioningInfo={sectioningInfo} />}
          </DataFetcher>
        )}
      />

      <AuthenticatedRoute
        path="/lab/extraction"
        render={() => <Extraction />}
      />

      <AuthenticatedRoute
        path="/lab/visium_cdna"
        render={() => (
          <SlotCopy
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
            dataFetcher={getRegistrationInfo}
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
            dataFetcher={getRegistrationInfo}
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
            dataFetcher={getReleaseInfo}
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

                return findLocationByBarcode(
                  routeProps.match.params.locationBarcode
                );
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
            dataFetcher={getDestroyInfo}
          >
            {(destroyInfo) => <Destroy destroyInfo={destroyInfo} />}
          </DataFetcher>
        )}
      />

      <Route
        path={["/", "/search"]}
        render={(routeProps) => {
          const params: ParsedQuery = parseQueryString(
            routeProps.location.search
          );
          const findRequestKeys: (keyof FindRequest)[] = [
            "labwareBarcode",
            "tissueExternalName",
            "donorName",
            "tissueType",
          ];
          const findRequest: FindRequest = _.merge(
            {
              labwareBarcode: "",
              tissueExternalName: "",
              donorName: "",
              tissueType: "",
            },
            cleanParams(params, findRequestKeys)
          );
          return (
            <DataFetcher dataFetcher={getSearchInfo}>
              {(searchInfo) => (
                <Search searchInfo={searchInfo} findRequest={findRequest} />
              )}
            </DataFetcher>
          );
        }}
      />
    </Switch>
  );
}
