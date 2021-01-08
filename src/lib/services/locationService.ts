import client from "../../lib/client";
import {
  EmptyLocationDocument,
  EmptyLocationMutation,
  EmptyLocationMutationVariables,
  FindLabwareLocationDocument,
  FindLabwareLocationQuery,
  FindLabwareLocationQueryVariables,
  FindLocationByBarcodeDocument,
  FindLocationByBarcodeQuery,
  FindLocationByBarcodeQueryVariables,
  LocationFieldsFragment,
  Maybe,
  SetLocationCustomNameDocument,
  SetLocationCustomNameMutation,
  SetLocationCustomNameMutationVariables,
  StoreBarcodeDocument,
  StoreBarcodeMutation,
  StoreBarcodeMutationVariables,
  UnstoreBarcodeDocument,
  UnstoreBarcodeMutation,
  UnstoreBarcodeMutationVariables,
} from "../../types/graphql";
import { QueryOptions } from "@apollo/client";
import { LocationMachine } from "../machines/locations/locationMachineTypes";
import { buildLocationMachine } from "../factories/machineFactory";
import { RouteComponentProps } from "react-router-dom";
import {
  isLocationSearch,
  LocationMatchParams,
  LocationSearchParams,
} from "../../pages/Location";
import { safeParseQueryString } from "../helpers";

/**
 * Return a location machine based off the barcode of a location
 * @param locationBarcode barcode of a location
 */
export async function getLocationMachine(
  routeProps: RouteComponentProps<LocationMatchParams>
): Promise<LocationMachine> {
  let locationSearch = null;

  if (routeProps.location.search) {
    locationSearch = safeParseQueryString<LocationSearchParams>(
      routeProps.location.search,
      isLocationSearch
    );
  }
  const location = await findLocationByBarcode(
    routeProps.match.params.locationBarcode
  );
  return buildLocationMachine(location, locationSearch);
}

/**
 * Send a request to core to find a Location by barcode
 * @param barcode the barcode of the location to find
 * @param options options to pass to the query
 */
export async function findLocationByBarcode(
  barcode: string,
  options?: Omit<
    QueryOptions<
      FindLocationByBarcodeQueryVariables,
      FindLocationByBarcodeQuery
    >,
    "query" | "variables"
  >
): Promise<LocationFieldsFragment> {
  const response = await client.query<
    FindLocationByBarcodeQuery,
    FindLocationByBarcodeQueryVariables
  >({
    query: FindLocationByBarcodeDocument,
    variables: { barcode },
    ...options,
  });

  return response.data.location;
}

/**
 * Send a query to core to store a barcode in a location (possibly at a particular address)
 * @param barcode the barcode to store
 * @param location the location to store the barcode in
 * @param address (optional) the address at the location to store the barcode
 */
export async function storeBarcode(
  barcode: string,
  location: LocationFieldsFragment,
  address?: string
): Promise<LocationFieldsFragment> {
  const response = await client.mutate<
    StoreBarcodeMutation,
    StoreBarcodeMutationVariables
  >({
    mutation: StoreBarcodeDocument,
    variables: {
      barcode,
      locationBarcode: location.barcode,
      address: address === "" ? null : address,
    },
  });

  if (!response.data) {
    throw new Error("storeBarcode response data was null");
  }

  return response.data.storeBarcode.location;
}

/**
 * Calls core to unstore the barcode from wherever it is in storage.
 * Returns the updated location if successful, null otherwise.
 * @param barcode The barcode to unstore
 */
export async function unstoreBarcode(barcode: string): Promise<void> {
  const response = await client.mutate<
    UnstoreBarcodeMutation,
    UnstoreBarcodeMutationVariables
  >({
    mutation: UnstoreBarcodeDocument,
    variables: {
      barcode,
    },
  });

  if (!response.data) {
    throw new Error("unstoreBarcode response data was null");
  }
}

/**
 * Send a request to core to empty the location with this barcode of all its stored items
 * @param barcode the barcode of the location to empty
 */
export async function emptyLocation(
  barcode: string
): Promise<LocationFieldsFragment> {
  const response = await client.mutate<
    EmptyLocationMutation,
    EmptyLocationMutationVariables
  >({
    mutation: EmptyLocationDocument,
    variables: {
      barcode,
    },
  });

  if (!response.data) {
    throw new Error("emptyLocation response data was null");
  }

  return findLocationByBarcode(barcode, {
    fetchPolicy: "network-only",
  });
}

/**
 * Find the locations of a list of labware barcodes
 * @param barcode the labware barcode to find the location of
 * @return the location barcode, if one found. null otherwise.
 */
export async function findLabwareLocation(
  barcode: string
): Promise<Maybe<string>> {
  let response;

  try {
    response = await client.query<
      FindLabwareLocationQuery,
      FindLabwareLocationQueryVariables
    >({
      query: FindLabwareLocationDocument,
      variables: { barcodes: [barcode] },
    });
  } catch (e) {
    console.error("Error in findLabwareLocation");
    return null;
  }

  return response.data.stored.length === 1
    ? response.data.stored[0].location.barcode
    : null;
}

/**
 * Update the custom name of a location
 * @param locationBarcode the barcode of the location to update
 * @param newCustomName the new custom name of the location
 */
export async function setLocationCustomName(
  locationBarcode: string,
  newCustomName: string
): Promise<LocationFieldsFragment> {
  const response = await client.mutate<
    SetLocationCustomNameMutation,
    SetLocationCustomNameMutationVariables
  >({
    mutation: SetLocationCustomNameDocument,
    variables: {
      locationBarcode,
      newCustomName,
    },
  });

  // I'm not sure why this would be null. I would expect if mutate throws, it would do the throwing.
  if (!response.data) {
    throw new Error("setLocationCustomName response data was null");
  }

  return response.data.setLocationCustomName;
}
