import { locationRepository } from "../repositories/locationRepository";
import {
  EmptyLocationMutation,
  EmptyLocationMutationVariables,
  FindLabwareLocationQuery,
  FindLabwareLocationQueryVariables,
  FindLocationByBarcodeQuery,
  FindLocationByBarcodeQueryVariables,
  Location,
  LocationFieldsFragment,
  Maybe,
  SetLocationCustomNameMutation,
  SetLocationCustomNameMutationVariables,
  StoreBarcodeMutation,
  StoreBarcodeMutationVariables,
  StoredItem,
  UnstoreBarcodeMutation,
  UnstoreBarcodeMutationVariables,
} from "../../types/sdk";
import { graphql } from "msw";

const locationHandlers = [
  graphql.query<
    FindLocationByBarcodeQuery,
    FindLocationByBarcodeQueryVariables
  >("FindLocationByBarcode", (req, res, ctx) => {
    const location: Maybe<Location> = locationRepository.findByBarcode(
      req.variables.barcode
    );

    if (!location) {
      return res(
        ctx.errors([
          {
            message: `Location with barcode ${req.variables.barcode} could not be found`,
          },
        ])
      );
    }

    return res(
      ctx.data({
        location: locationResponse(location),
      })
    );
  }),

  graphql.mutation<StoreBarcodeMutation, StoreBarcodeMutationVariables>(
    "StoreBarcode",
    (req, res, ctx) => {
      debugger;
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
              message: (e as Error).message,
            },
          ])
        );
      }

      return res(
        ctx.data({
          storeBarcode: {
            location: locationResponse(item.location),
          },
        })
      );
    }
  ),
  /**
     graphql.mutation<StoreMutation, StoreMutationVariables>(
     "Store",
     (req, res, ctx) => {
      debugger;
      let location;
      try {
        location = locationRepository.store(
          req.variables.store,
          req.variables.locationBarcode,
        );
      } catch (e) {
        return res(
          ctx.errors([
            {
              message: (e as Error).message,
            },
          ])
        );
      }

      return res(
        ctx.data({
          store: {
            location: locationResponse(location),
          },
        })
      );
    }
     ),
     */

  graphql.mutation<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>(
    "UnstoreBarcode",
    (req, res, ctx) => {
      let item: Maybe<StoredItem> = null;
      try {
        item = locationRepository.unstoreBarcode(req.variables.barcode);
      } catch (e) {
        return res(
          ctx.errors([
            {
              message: (e as Error).message,
            },
          ])
        );
      }

      return res(
        ctx.data({
          unstoreBarcode: !item
            ? null
            : {
                barcode: item.barcode,
                address: item.address,
              },
        })
      );
    }
  ),

  graphql.mutation<EmptyLocationMutation, EmptyLocationMutationVariables>(
    "EmptyLocation",
    (req, res, ctx) => {
      let numUnstored;
      try {
        numUnstored = locationRepository.empty(req.variables.barcode);
      } catch (e) {
        return res(
          ctx.errors([
            {
              message: (e as Error).message,
            },
          ])
        );
      }

      return res(
        ctx.data({
          empty: { numUnstored },
        })
      );
    }
  ),

  graphql.query<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>(
    "FindLabwareLocation",
    (req, res, ctx) => {
      const storedItems: Array<StoredItem> = locationRepository.findByLabwareBarcode(
        Array.isArray(req.variables.barcodes)
          ? req.variables.barcodes
          : [req.variables.barcodes]
      );

      return res(
        ctx.data({
          stored: storedItems.map((item) => ({
            location: {
              barcode: item.location.barcode,
            },
          })),
        })
      );
    }
  ),

  graphql.mutation<
    SetLocationCustomNameMutation,
    SetLocationCustomNameMutationVariables
  >("SetLocationCustomName", (req, res, ctx) => {
    const location = locationRepository.findByBarcode(
      req.variables.locationBarcode
    );

    if (location == null) {
      return res(
        ctx.errors([
          {
            message: `Location ${req.variables.locationBarcode} could not be found`,
          },
        ])
      );
    }

    location.customName = req.variables.newCustomName;
    locationRepository.save(location);

    return res(
      ctx.data({
        setLocationCustomName: locationResponse(location),
      })
    );
  }),
];

export default locationHandlers;

function locationResponse(location: Location): LocationFieldsFragment {
  return {
    __typename: "Location",
    barcode: location.barcode,
    fixedName: location.fixedName,
    customName: location.customName,
    address: location.address,
    direction: location.direction,
    parent: location.parent
      ? {
          __typename: "LinkedLocation",
          barcode: location.parent.barcode,
          fixedName: location.parent.fixedName,
          customName: location.parent.customName,
        }
      : null,
    size: location.size
      ? {
          __typename: "Size",
          numRows: location.size.numRows,
          numColumns: location.size.numColumns,
        }
      : null,
    stored: location.stored.map((item) => ({
      __typename: "StoredItem",
      barcode: item.barcode,
      address: item.address,
    })),
    children: location.children.map((child) => {
      return {
        __typename: "LinkedLocation",
        barcode: child.barcode,
        fixedName: child.fixedName,
        customName: child.customName,
        address: child.address,
      };
    }),
  };
}
