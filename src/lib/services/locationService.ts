import { LabwareFieldsFragment, LocationFieldsFragment, Maybe, StoreInput } from '../../types/sdk';
import { stanCore } from '../sdk';
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
  const response = await stanCore.StoreBarcode({
    barcode,
    locationBarcode: location.barcode,
    address: address === '' ? null : address
  });

  if (!response) {
    throw new Error('storeBarcode response data was null');
  }

  return response.storeBarcode.location;
}

/**
 * Send a query to core to store a list of barcodes to given addresses in a location
 * @param store list of items to store which` is an array of objects containing barcode and address
 * @param location the location to store the barcode in
 */
export async function store(store: StoreInput[], location: LocationFieldsFragment): Promise<LocationFieldsFragment> {
  const response = await stanCore.Store({
    store,
    locationBarcode: location.barcode
  });

  if (!response) {
    throw new Error('storeBarcode response data was null');
  }

  return response.store;
}

/**
 * Calls core to unstore the barcode from wherever it is in storage.
 * Returns the updated location if successful, null otherwise.
 * @param barcode The barcode to unstore
 */
export async function unstoreBarcode(barcode: string): Promise<void> {
  const response = await stanCore.UnstoreBarcode({ barcode });

  if (!response) {
    throw new Error('unstoreBarcode response data was null');
  }
}

/**
 * Send a request to core to empty the location with this barcode of all its stored items
 * @param barcode the barcode of the location to empty
 */
export async function emptyLocation(barcode: string): Promise<LocationFieldsFragment> {
  const response = stanCore.EmptyLocation({ barcode });

  if (!response) {
    throw new Error('emptyLocation response data was null');
  }

  return stanCore.FindLocationByBarcode({ barcode }).then((res) => res.location);
}

/**
 * Find the locations of a list of labware barcodes
 * @param barcode the labware barcode to find the location of
 * @return the location barcode, if one found. null otherwise.
 */
export async function findLabwareLocation(barcode: string): Promise<Maybe<string>> {
  let response;

  try {
    response = await stanCore.FindLabwareLocation({ barcodes: [barcode] });
  } catch (e) {
    console.error('Error in findLabwareLocation');
    return null;
  }

  return response.stored.length === 1 ? response.stored[0].location.barcode : null;
}

/**
 * Find all labware stored in location specified by location barcode
 * @param locationBarcode the labware barcode to find the location of
 * @return all labware details stored in the given location
 */
export async function getLabwareInLocation(locationBarcode: string): Promise<Maybe<LabwareFieldsFragment[]>> {
  let response;
  try {
    response = await stanCore.GetLabwareInLocation({ locationBarcode: locationBarcode });
  } catch (e) {
    console.error('Error in findLabwareInLocation');
    return null;
  }
  return response.labwareInLocation;
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
  const { setLocationCustomName } = await stanCore.SetLocationCustomName({
    locationBarcode,
    newCustomName
  });

  // I'm not sure why this would be null. I would expect if mutate throws, it would do the throwing.
  if (!setLocationCustomName) {
    throw new Error('setLocationCustomName response data was null');
  }

  return setLocationCustomName;
}

/**
 * Get details of specified location
 */
export async function getLocation(barcode: string): Promise<LocationFieldsFragment | undefined> {
  const { location } = await stanCore.FindLocationByBarcode({ barcode });
  if (!location) {
    return undefined;
  }
  return location;
}

/**
 * Get details of specified location
 */
export async function transferItems(
  sourceBarcode: string,
  destinationBarcode: string
): Promise<LocationFieldsFragment | undefined> {
  const { transfer } = await stanCore.TransferLocationItems({ sourceBarcode, destinationBarcode });
  return transfer;
}
