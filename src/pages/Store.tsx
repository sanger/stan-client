import React, { useContext, useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import LocationSearch from "../components/LocationSearch";
import { RouteComponentProps } from "react-router";
import { safeParseQueryString, stringify } from "../lib/helpers";
import { findLabwareLocation } from "../lib/services/locationService";
import Warning from "../components/notifications/Warning";
import MutedText from "../components/MutedText";
import LocationIcon from "../components/icons/LocationIcon";
import Heading from "../components/Heading";

import storeConfig from "../static/store.json";
import { Link, Prompt, useHistory } from "react-router-dom";
import BarcodeIcon from "../components/icons/BarcodeIcon";
import { FindLocationByBarcodeQuery, Maybe } from "../types/sdk";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import { isLocationSearch, LocationSearchParams } from "../types/stan";
import { StanCoreContext } from "../lib/sdk";
import { ClientError } from "graphql-request";
import LabwareAwaitingStorage from "./location/LabwareAwaitingStorage";
import * as H from "history";

/**
 * RouteComponentProps from react-router allows the props to be passed in
 */
interface StoreProps extends RouteComponentProps {}

export type LabwareAwaitingStorageInfo = {
  barcode: string;
  labwareType: string;
};
export type AwaitingStorageStateType = {
  awaitingLabwares: LabwareAwaitingStorageInfo[];
};
export function isAwaitingLabwareState(
  obj: any
): obj is AwaitingStorageStateType {
  if (!obj) return false;
  return (
    "awaitingLabwares" in obj && typeof obj["awaitingLabwares"] === "object"
  );
}

/**
 * Custom hook to update the url state with the current list of labwares (awaiting storage) for back and forth action in browser page
 */
export function useSessionHistoryStateForLabwares() {
  const history = useHistory();
  const unListener = React.useRef<H.UnregisterCallback>();
  React.useEffect(() => {
    //Listen to history events
    /*When you attach a listener using history.listen, it returns a function that can be used to remove the listener,
     which can then be invoked in cleanup logic:*/
    unListener.current = history.listen((location) => {
      const awaitingLabwareEntry = sessionStorage.getItem("awaitingLabwares");
      //This is a goBack or goForward action, so update url state
      if (
        history.action === "POP" &&
        location.state &&
        isAwaitingLabwareState(location.state) &&
        awaitingLabwareEntry !== null
      ) {
        let currentAwaitingLabwares: LabwareAwaitingStorageInfo[] = [];
        //if sessionStorage conains an entry, update labwares otherwise to an empty array
        if (awaitingLabwareEntry.length > 0) {
          const awaitingLabwareBarcodes = awaitingLabwareEntry.split(",");
          if (awaitingLabwareBarcodes.length > 0) {
            currentAwaitingLabwares = location.state.awaitingLabwares.filter(
              (item) => awaitingLabwareBarcodes.includes(item.barcode)
            );
          }
        }
        const urlPath = history.location.search
          ? `${history.location.pathname}${history.location.search}`
          : history.location.pathname;
        history.replace(urlPath, {
          awaitingLabwares: currentAwaitingLabwares,
        });
      }
      //cleanup listener
      return () => {
        if (unListener.current) {
          unListener.current();
        }
      };
    });
  }, [history]);
  return history;
}

/**
 *
 * @param location - location to navigate
 * @param action - action performed
 * @param awaitingLabwares
 * Clear session storage for awaiting labwares if it is navigating to a page other than /location or /store
 * Session storage will be used for following operations
 * a) Go back and Go forward operation to a Location/Store page
 * b) Going to a new location page by invoking a store location link or through a search
 */
export function awaitingStorageCheckOnExit(
  location: H.Location,
  action: H.Action,
  awaitingLabwares: LabwareAwaitingStorageInfo[]
) {
  if (
    (action === "POP" &&
      ["/locations", "/store"].some((path) =>
        location.pathname.startsWith(path)
      )) ||
    (action === "PUSH" && location.pathname.startsWith("/locations"))
  ) {
    return true;
  } else {
    sessionStorage.removeItem("awaitingLabwares");
    if (awaitingLabwares.length > 0) {
      return "You have unstored labwares. Are you sure you want to leave?";
    } else {
      return true;
    }
  }
}

const Store: React.FC<StoreProps> = ({ location }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [awaitingLabwares, setAwaitingLabwares] = useState<
    LabwareAwaitingStorageInfo[]
  >([]);
  const history = useSessionHistoryStateForLabwares();
  /**
   * Runs this hook if there's a `labwareBarcode` URL parameter
   * Looks up the location for the labware, and redirects to that page
   */
  useEffect(() => {
    async function invokeFindLabwareLocation(
      labwareBarcode: string,
      awaitingLabwares: LabwareAwaitingStorageInfo[]
    ) {
      const locationBarcode = await findLabwareLocation(labwareBarcode);
      if (locationBarcode) {
        // Redirect to the location if it's found
        history.push({
          pathname: `/locations/${locationBarcode}`,
          state:
            awaitingLabwares.length > 0
              ? {
                  awaitingLabwares: awaitingLabwares,
                }
              : {},
          search: stringify({
            labwareBarcode: labwareBarcode,
          }),
        });
      } else {
        setErrorMessage(`${labwareBarcode} could not be found in storage`);
      }
    }
    let awaitingLabwares: LabwareAwaitingStorageInfo[] = [];
    if (isAwaitingLabwareState(location.state)) {
      awaitingLabwares = location.state.awaitingLabwares;
      setAwaitingLabwares(awaitingLabwares);
    }
    if (location.search) {
      const locationSearchParams = safeParseQueryString<LocationSearchParams>({
        query: location.search,
        guard: isLocationSearch,
      });
      if (locationSearchParams) {
        invokeFindLabwareLocation(
          locationSearchParams.labwareBarcode.trim(),
          awaitingLabwares
        );
      }
    }
  }, [location.search, location.state, history]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Store</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto max-w-screen-xl">
          {errorMessage && (
            <Warning message={"Labware not found"}>{errorMessage}</Warning>
          )}
          <MutedText className="mt-5">
            To get started, scan either the location you want to find, or scan a
            piece of labware to find its location.
          </MutedText>
          <LocationSearch awaitingLabwares={awaitingLabwares} />
          <div className="my-10 space-y-24">
            {Object.entries(storeConfig.locationType).map(
              ([groupTitle, locations]) => (
                <div key={groupTitle}>
                  <Heading level={2}>{groupTitle}</Heading>
                  <div className="mt-10">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                      {locations.map((location) => (
                        <LocationLink
                          key={location.barcode}
                          barcode={location.barcode}
                          awaitingLabwares={awaitingLabwares}
                        />
                      ))}
                    </dl>
                  </div>
                </div>
              )
            )}
          </div>
          {awaitingLabwares && awaitingLabwares.length > 0 && (
            <LabwareAwaitingStorage
              labwares={awaitingLabwares}
              storeEnabled={false}
              onStoreLabwares={() => {}}
            />
          )}
        </div>
      </AppShell.Main>
      <Prompt
        message={(location, action) =>
          awaitingStorageCheckOnExit(location, action, awaitingLabwares)
        }
      />
    </AppShell>
  );
};

export default Store;

interface LocationLinkProps {
  barcode: string;
  awaitingLabwares?: LabwareAwaitingStorageInfo[];
}

const LocationLink: React.FC<LocationLinkProps> = ({
  barcode,
  awaitingLabwares,
}) => {
  const stanCore = useContext(StanCoreContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Maybe<ClientError>>(null);
  const [location, setLocation] = useState<
    FindLocationByBarcodeQuery["location"] | null
  >(null);

  useEffect(() => {
    async function findLocationByBarcode() {
      try {
        const { location } = await stanCore.FindLocationByBarcode({
          barcode,
        });
        setLocation(location);
      } catch (e) {
        setError(e as ClientError);
      } finally {
        setLoading(false);
      }
    }
    findLocationByBarcode();
  }, [stanCore, barcode, setLocation, setError, setLoading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Warning message={`Failed to load Location ${barcode}`} />;
  }

  return (
    <Link
      key={location?.barcode}
      to={{
        pathname: `/locations/${location?.barcode}`,
        state: awaitingLabwares ? { awaitingLabwares: awaitingLabwares } : {},
      }}
    >
      <div className="border border-gray-200 p-4 flex bg-gray-50 hover:bg-gray-200 rounded">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sdb-400 text-white">
            <LocationIcon iconStyle="stroke" className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-4">
          <dt className="text-lg leading-6 font-medium text-gray-900">
            {location?.customName}
          </dt>
          <dd className="mt-2 text-base text-gray-500">
            <BarcodeIcon className="inline-block -mt-1 h-5 w-5" />{" "}
            {location?.barcode}
          </dd>
        </div>
      </div>
    </Link>
  );
};
