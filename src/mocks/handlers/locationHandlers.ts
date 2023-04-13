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
import { graphql } from 'msw';

const locationHandlers = [
  graphql.query<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(
    'FindLocationByBarcode',
    (req, res, ctx) => {
      const location: Maybe<Location> = locationRepository.findByBarcode(req.variables.barcode);

      if (!location) {
        return res(
          ctx.errors([
            {
              message: `Location with barcode ${req.variables.barcode} could not be found`
            }
          ])
        );
      }

      return res(
        ctx.data({
          location: locationResponse(location)
        })
      );
    }
  ),

  graphql.mutation<StoreBarcodeMutation, StoreBarcodeMutationVariables>('StoreBarcode', (req, res, ctx) => {
    let item;
    try {
      item = locationRepository.storeBarcode(
        req.variables.barcode,
        req.variables.locationBarcode,
        req.variables.address
      );
    } catch (e) {
      return res(
        ctx.errors([
          {
            message: (e as Error).message
          }
        ])
      );
    }

    return res(
      ctx.data({
        storeBarcode: {
          location: locationResponse(item.location)
        }
      })
    );
  }),

  graphql.mutation<StoreMutation, StoreMutationVariables>('Store', (req, res, ctx) => {
    let location;
    try {
      location = locationRepository.store(req.variables.store, req.variables.locationBarcode);
    } catch (e) {
      return res(
        ctx.errors([
          {
            message: (e as Error).message
          }
        ])
      );
    }
    return res(
      ctx.data({
        store: locationResponse(location)
      })
    );
  }),

  graphql.mutation<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>('UnstoreBarcode', (req, res, ctx) => {
    let item: Maybe<StoredItem> = null;
    try {
      item = locationRepository.unstoreBarcode(req.variables.barcode);
    } catch (e) {
      return res(
        ctx.errors([
          {
            message: (e as Error).message
          }
        ])
      );
    }

    return res(
      ctx.data({
        unstoreBarcode: !item
          ? null
          : {
              barcode: item.barcode,
              address: item.address
            }
      })
    );
  }),

  graphql.mutation<EmptyLocationMutation, EmptyLocationMutationVariables>('EmptyLocation', (req, res, ctx) => {
    let numUnstored;
    try {
      numUnstored = locationRepository.empty(req.variables.barcode);
    } catch (e) {
      return res(
        ctx.errors([
          {
            message: (e as Error).message
          }
        ])
      );
    }

    return res(
      ctx.data({
        empty: { numUnstored }
      })
    );
  }),

  graphql.query<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>('FindLabwareLocation', (req, res, ctx) => {
    const storedItems: Array<StoredItem> = locationRepository.findByLabwareBarcode(
      Array.isArray(req.variables.barcodes) ? req.variables.barcodes : [req.variables.barcodes]
    );

    return res(
      ctx.data({
        stored: storedItems.map((item) => ({
          location: {
            barcode: item.location.barcode
          }
        }))
      })
    );
  }),

  graphql.mutation<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>(
    'SetLocationCustomName',
    (req, res, ctx) => {
      const location = locationRepository.findByBarcode(req.variables.locationBarcode);

      if (location == null) {
        return res(
          ctx.errors([
            {
              message: `Location ${req.variables.locationBarcode} could not be found`
            }
          ])
        );
      }

      location.customName = req.variables.newCustomName;
      locationRepository.save(location);

      return res(
        ctx.data({
          setLocationCustomName: locationResponse(location)
        })
      );
    }
  ),

  graphql.mutation<TransferLocationItemsMutation, TransferLocationItemsMutationVariables>(
    'TransferLocationItems',
    (req, res, ctx) => {
      const sourceLocation = locationRepository.findByBarcode(req.variables.sourceBarcode);
      const destLocation = locationRepository.findByBarcode(req.variables.destinationBarcode);
      if (!sourceLocation) {
        return res(
          ctx.errors([
            {
              message: `Location ${req.variables.sourceBarcode} could not be found`
            }
          ])
        );
      }
      if (!destLocation) {
        return res(
          ctx.errors([
            {
              message: `Location ${req.variables.destinationBarcode} could not be found`
            }
          ])
        );
      }
      destLocation.stored = [...sourceLocation.stored];
      sourceLocation.stored = [];

      return res(
        ctx.data({
          transfer: destLocation
        })
      );
    }
  ),

  /*** The root is the first element, and the location  requested is the last element
        For example, if there is a box in a drawer in a freezer, the freezer will be first and the box will be last
   ***/
  graphql.query<FindStoragePathQuery, FindStoragePathQueryVariables>('FindStoragePath', (req, res, ctx) => {
    const linkedLocationArray: LinkedLocationFieldsFragment[] = [];
    addLocationHierarchy(req.variables.locationBarcode, linkedLocationArray);
    return res(
      ctx.data({
        storagePath: linkedLocationArray
      })
    );
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
    fixedName: location.fixedName
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
        address: child.address
      };
    })
  };
}
