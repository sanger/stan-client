import React, { useContext, useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import LocationSearch from "../components/LocationSearch";
import { RouteComponentProps } from "react-router";
import { safeParseQueryString } from "../lib/helpers";
import { findLabwareLocation } from "../lib/services/locationService";
import Warning from "../components/notifications/Warning";
import MutedText from "../components/MutedText";
import LocationIcon from "../components/icons/LocationIcon";
import Heading from "../components/Heading";

import storeConfig from "../static/store.json";
import { Link } from "react-router-dom";
import BarcodeIcon from "../components/icons/BarcodeIcon";
import { FindLocationByBarcodeQuery } from "../types/sdk";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import { isLocationSearch, LocationSearchParams } from "../types/stan";
import { history, StanCoreContext } from "../lib/sdk";

/**
 * RouteComponentProps from react-router allows the props to be passed in
 */
interface StoreProps extends RouteComponentProps {}

const Store: React.FC<StoreProps> = ({ location }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Runs this hook if there's a `labwareBarcode` URL parameter
   *
   * Looks up the location for the labware, and redirects to that page
   */
  useEffect(() => {
    async function invokeFindLabwareLocation(labwareBarcode: string) {
      debugger;
      const locationBarcode = await findLabwareLocation(labwareBarcode);

      if (locationBarcode) {
        // Redirect to the location if it's found
        history.push(
          `/locations/${locationBarcode}?labwareBarcode=${labwareBarcode}`
        );
      } else {
        setErrorMessage(`${labwareBarcode} could not be found in storage`);
      }
    }

    if (location.search) {
      const locationSearchParams = safeParseQueryString<LocationSearchParams>({
        query: location.search,
        guard: isLocationSearch,
      });

      if (locationSearchParams) {
        invokeFindLabwareLocation(locationSearchParams.labwareBarcode.trim());
      }
    }
  }, [location.search]);

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
          <LocationSearch />
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
                        />
                      ))}
                    </dl>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Store;

interface LocationLinkProps {
  barcode: string;
}

const LocationLink: React.FC<LocationLinkProps> = ({ barcode }) => {
  const stanCore = useContext(StanCoreContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        setError(e);
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
    <Link key={location?.barcode} to={`/locations/${location?.barcode}`}>
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
