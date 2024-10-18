import { locationRepository } from '../repositories/locationRepository';
import {
  EmptyLocationMutation,
  EmptyLocationMutationVariables,
  FindLabwareLocationQuery,
  FindLabwareLocationQueryVariables,
  FindLocationByBarcodeQuery,
  FindLocationByBarcodeQueryVariables,
  FindStoragePathQuery,
  FindStoragePathQueryVariables,
  LinkedLocationFieldsFragment,
  Location,
  LocationFieldsFragment,
  Maybe,
  SetLocationCustomNameMutation,
  SetLocationCustomNameMutationVariables,
  StoreBarcodeMutation,
  StoreBarcodeMutationVariables,
  StoredItem,
  StoreMutation,
  StoreMutationVariables,
  TransferLocationItemsMutation,
  TransferLocationItemsMutationVariables,
  UnstoreBarcodeMutation,
  UnstoreBarcodeMutationVariables
} from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';

const locationHandlers = [
  graphql.query<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(
    'FindLocationByBarcode',
    ({ variables }) => {
      const location: Maybe<Location> = locationRepository.findByBarcode(variables.barcode);

      if (!location) {
        return HttpResponse.json(
          { errors: [{ message: `Location with barcode ${variables.barcode} could not be found` }] },
          { status: 404 }
        );
      }

      return HttpResponse.json({ data: { location: locationResponse(location) } }, { status: 200 });
    }
  ),

  graphql.mutation<StoreBarcodeMutation, StoreBarcodeMutationVariables>('StoreBarcode', ({ variables }) => {
    let item;
    try {
      item = locationRepository.storeBarcode(variables.barcode, variables.locationBarcode, variables.address);
    } catch (e) {
      return HttpResponse.json({ errors: [{ message: (e as Error).message }] }, { status: 400 });
    }
    return HttpResponse.json(
      { data: { storeBarcode: { location: locationResponse(item.location) } } },
      { status: 200 }
    );
  }),

  graphql.mutation<StoreMutation, StoreMutationVariables>('Store', ({ variables }) => {
    let location;
    try {
      location = locationRepository.store(variables.store, variables.locationBarcode);
    } catch (e) {
      return HttpResponse.json({ errors: [{ message: (e as Error).message }] }, { status: 400 });
    }
    return HttpResponse.json({ data: { store: locationResponse(location) } }, { status: 200 });
  }),

  graphql.mutation<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>('UnstoreBarcode', ({ variables }) => {
    let item: Maybe<StoredItem> = null;
    try {
      item = locationRepository.unstoreBarcode(variables.barcode);
    } catch (e) {
      return HttpResponse.json({ errors: [{ message: (e as Error).message }] }, { status: 400 });
    }
    return HttpResponse.json(
      { data: { unstoreBarcode: !item ? null : { barcode: item.barcode, address: item.address } } },
      { status: 200 }
    );
  }),

  graphql.mutation<EmptyLocationMutation, EmptyLocationMutationVariables>('EmptyLocation', ({ variables }) => {
    let numUnstored;
    try {
      numUnstored = locationRepository.empty(variables.barcode);
    } catch (e) {
      return HttpResponse.json({ errors: [{ message: (e as Error).message }] }, { status: 400 });
    }
    return HttpResponse.json({ data: { empty: { numUnstored } } }, { status: 200 });
  }),

  graphql.query<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>('FindLabwareLocation', ({ variables }) => {
    const storedItems: Array<StoredItem> = locationRepository.findByLabwareBarcode(
      Array.isArray(variables.barcodes) ? variables.barcodes : [variables.barcodes]
    );
    return HttpResponse.json(
      {
        data: {
          stored: storedItems.map((item) => ({
            location: {
              barcode: item.location.barcode
            }
          }))
        }
      },
      { status: 200 }
    );
  }),

  graphql.mutation<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>(
    'SetLocationCustomName',
    ({ variables }) => {
      const location = locationRepository.findByBarcode(variables.locationBarcode);

      if (location == null) {
        return HttpResponse.json(
          { errors: [{ message: `Location ${variables.locationBarcode} could not be found` }] },
          { status: 404 }
        );
      }

      location.customName = variables.newCustomName;
      locationRepository.save(location);
      return HttpResponse.json({ data: { setLocationCustomName: locationResponse(location) } }, { status: 200 });
    }
  ),

  graphql.mutation<TransferLocationItemsMutation, TransferLocationItemsMutationVariables>(
    'TransferLocationItems',
    ({ variables }) => {
      const sourceLocation = locationRepository.findByBarcode(variables.sourceBarcode);
      const destLocation = locationRepository.findByBarcode(variables.destinationBarcode);
      if (!sourceLocation) {
        return HttpResponse.json(
          { errors: [{ message: `Location ${variables.sourceBarcode} could not be found` }] },
          { status: 404 }
        );
      }
      if (!destLocation) {
        return HttpResponse.json(
          { errors: [{ message: `Location ${variables.destinationBarcode} could not be found` }] },
          { status: 404 }
        );
      }
      destLocation.stored = [...sourceLocation.stored];
      sourceLocation.stored = [];

      return HttpResponse.json({ data: { transfer: destLocation } }, { status: 200 });
    }
  ),

  /*** The root is the first element, and the location  requested is the last element
        For example, if there is a box in a drawer in a freezer, the freezer will be first and the box will be last
   ***/
  graphql.query<FindStoragePathQuery, FindStoragePathQueryVariables>('FindStoragePath', ({ variables }) => {
    const linkedLocationArray: LinkedLocationFieldsFragment[] = [];
    addLocationHierarchy(variables.locationBarcode, linkedLocationArray);
    return HttpResponse.json({ data: { storagePath: linkedLocationArray } }, { status: 200 });
  })
];

export default locationHandlers;

function addLocationHierarchy(barcode: string, linkedLocation: LinkedLocationFieldsFragment[]) {
  const location = locationRepository.findByBarcode(barcode);
  if (!location) {
    return;
  }
  linkedLocation.unshift({
    barcode: location.barcode,
    address: location.address,
    customName: location.customName,
    fixedName: location.fixedName,
    numStored: location.numStored,
    leaf: location.leaf
  });
  if (location.parent) {
    addLocationHierarchy(location.parent.barcode, linkedLocation);
  } else return;
}

export function locationResponse(location: Location): LocationFieldsFragment {
  return {
    __typename: 'Location',
    barcode: location.barcode,
    fixedName: location.fixedName,
    customName: location.customName,
    address: location.address,
    direction: location.direction,
    numStored: location.numStored,
    parent: location.parent
      ? {
          __typename: 'LinkedLocation',
          barcode: location.parent.barcode,
          fixedName: location.parent.fixedName,
          customName: location.parent.customName
        }
      : null,
    size: location.size
      ? {
          __typename: 'Size',
          numRows: location.size.numRows,
          numColumns: location.size.numColumns
        }
      : null,
    stored: location.stored.map((item) => ({
      __typename: 'StoredItem',
      barcode: item.barcode,
      address: item.address
    })),
    children: location.children.map((child) => {
      return {
        __typename: 'LinkedLocation',
        barcode: child.barcode,
        fixedName: child.fixedName,
        customName: child.customName,
        address: child.address,
        numStored: child.numStored,
        leaf: child.leaf
      };
    })
  };
}
