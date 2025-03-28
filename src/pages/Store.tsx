import React, { useContext, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import LocationSearch from '../components/LocationSearch';
import { safeParseQueryString, stringify } from '../lib/helpers';
import { findLabwareLocation } from '../lib/services/locationService';
import Warning from '../components/notifications/Warning';
import MutedText from '../components/MutedText';
import LocationIcon from '../components/icons/LocationIcon';
import Heading from '../components/Heading';

import storeConfig from '../static/store.json';
import { Link, Location, NavigationType, useLocation, useNavigate } from 'react-router-dom';
import BarcodeIcon from '../components/icons/BarcodeIcon';
import { FindLocationByBarcodeQuery, Maybe } from '../types/sdk';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import { isLocationSearch, LocationSearchParams } from '../types/stan';
import { StanCoreContext } from '../lib/sdk';
import { ClientError } from 'graphql-request';
import LabwareAwaitingStorage from './location/LabwareAwaitingStorage';
import PromptOnLeave from '../components/notifications/PromptOnLeave';

export type LabwareAwaitingStorageInfo = {
  barcode: string;
  labwareType: string;
  externalIdentifier: string;
  donor: string;
  tissueType: string;
  spatialLocation: string;
  replicate: string;
};

export type BlockerFunctionParams = {
  currentLocation: Location;
  nextLocation: Location;
  historyAction: NavigationType;
};

/**
 *
 * @param nextLocation - location to navigate
 * @param currentLocation - current location
 * @param historyAction - action performed
 * Clear session storage for awaiting labwares if it is navigating to a page other than /location or /store
 * Session storage will be used for following operations
 * a) Go back and Go forward operation to a Location/Store page
 * b) Going to a new location page by invoking a store location link or through a search
 */
export function awaitingStorageCheckOnExit(args: BlockerFunctionParams) {
  /**PUSH is the action for  invoking/visiting a link or for pushing a new entry onto the history stack
   * POP is the action send while you navigate using the browser's forward/back buttons.
   * **/
  if (args) {
    if (
      (args.historyAction === 'POP' &&
        ['/locations', '/store'].some((path) => args.nextLocation.pathname.startsWith(path))) ||
      (args.historyAction === 'PUSH' && args.nextLocation.pathname.startsWith('/locations'))
    ) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}

/**Get awaiting labware list from session storage**/
export function getAwaitingLabwaresFromSession() {
  const awaitingLabwareValue = sessionStorage.getItem('awaitingLabwares');
  if (!awaitingLabwareValue || awaitingLabwareValue.length <= 0) return [];
  const awaitingLabwareInfoStr = awaitingLabwareValue.split(',');
  const defaultLabwareInfo: LabwareAwaitingStorageInfo = {
    barcode: '',
    labwareType: '',
    externalIdentifier: '',
    donor: '',
    tissueType: '',
    spatialLocation: '',
    replicate: ''
  };
  const labwareInfoFields = Object.keys(defaultLabwareInfo);
  //if data in session storage doesn't match with the expected labware information
  if (awaitingLabwareInfoStr.length % labwareInfoFields.length !== 0) {
    return [];
  }
  const awaitingLabwareInfo: string[][] = [];
  //pack each individual labware info into an array of string
  for (let indx = 0; indx < awaitingLabwareInfoStr.length; indx += labwareInfoFields.length) {
    awaitingLabwareInfo.push(awaitingLabwareInfoStr.slice(indx, indx + labwareInfoFields.length));
  }
  //create awaitingLabwareInfo object from string values in an array
  return awaitingLabwareInfo.reduce((previousValue: LabwareAwaitingStorageInfo[], currentValue) => {
    const labwareInfo = { ...defaultLabwareInfo };
    currentValue.forEach((value, index) => {
      labwareInfo[labwareInfoFields[index] as keyof LabwareAwaitingStorageInfo] = value;
    });
    return [...previousValue, labwareInfo];
  }, []);
}

const Store = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();

  /**Leaving to another page from a prompt dialog, so clear the sessionStorage before leaving this page**/
  const onLeave = React.useCallback(() => {
    sessionStorage.removeItem('awaitingLabwares');
  }, []);

  const navigate = useNavigate();

  /**
   * Runs this hook if there's a `labwareBarcode` URL parameter
   * Looks up the location for the labware, and redirects to that page
   */
  useEffect(() => {
    async function invokeFindLabwareLocation(labwareBarcode: string) {
      const locationBarcode = await findLabwareLocation(labwareBarcode);
      if (locationBarcode) {
        // Redirect to the location if it's found
        navigate({
          pathname: `/locations/${locationBarcode}`,
          search: stringify({
            labwareBarcode: labwareBarcode
          })
        });
      } else {
        setErrorMessage(`${labwareBarcode} could not be found in storage`);
      }
    }
    if (location.search) {
      const locationSearchParams = safeParseQueryString<LocationSearchParams>({
        query: location.search,
        guard: isLocationSearch
      });
      if (locationSearchParams) {
        invokeFindLabwareLocation(locationSearchParams.labwareBarcode.trim());
      }
    }
  }, [location.search, location.state, navigate]);

  const awaitingLabwares = getAwaitingLabwaresFromSession();

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Store</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto max-w-screen-xl">
          {errorMessage && <Warning message={'Labware not found'}>{errorMessage}</Warning>}
          <MutedText className="mt-5">
            To get started, scan either the location you want to find, or scan a piece of labware to find its location.
          </MutedText>
          <LocationSearch />
          <div className="my-10 space-y-24">
            {Object.entries(storeConfig.locationType).map(([groupTitle, locations]) => (
              <div key={groupTitle}>
                <Heading level={2}>{groupTitle}</Heading>
                <div className="mt-10">
                  <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                    {locations.map((location) => (
                      <LocationLink key={location.barcode} barcode={location.barcode} />
                    ))}
                  </dl>
                </div>
              </div>
            ))}
          </div>
          {awaitingLabwares && awaitingLabwares.length > 0 && (
            <LabwareAwaitingStorage labwares={awaitingLabwares} storeEnabled={false} onStoreLabwares={() => {}} />
          )}
        </div>
      </AppShell.Main>
      {awaitingLabwares.length > 0 && (
        <PromptOnLeave
          when={awaitingStorageCheckOnExit}
          message={'You have labware that is not stored. Are you sure you want to leave?'}
          onPromptLeave={onLeave}
        />
      )}
    </AppShell>
  );
};

export default Store;

interface LocationLinkProps {
  barcode: string;
  awaitingLabwares?: LabwareAwaitingStorageInfo[];
}

const LocationLink: React.FC<LocationLinkProps> = ({ barcode }) => {
  const stanCore = useContext(StanCoreContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Maybe<ClientError>>(null);
  const [location, setLocation] = useState<FindLocationByBarcodeQuery['location'] | null>(null);

  useEffect(() => {
    async function findLocationByBarcode() {
      try {
        const { location } = await stanCore.FindLocationByBarcode({
          barcode
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
        pathname: `/locations/${location?.barcode}`
      }}
    >
      <div className="border border-gray-200 p-4 flex bg-gray-50 hover:bg-gray-200 rounded">
        <div className="shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sdb-400 text-white">
            <LocationIcon iconStyle="stroke" className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-4">
          <dt className="text-lg leading-6 font-medium text-gray-900">{location?.customName}</dt>
          <dd className="mt-2 text-base text-gray-500">
            <BarcodeIcon className="inline-block -mt-1 h-5 w-5" /> {location?.barcode}
          </dd>
        </div>
      </div>
    </Link>
  );
};
