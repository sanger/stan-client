import { Factory } from "fishery";
import { cloneDeep, padStart } from "lodash";
import type {
  LinkedLocation,
  Location,
  Size,
  StoredItem,
} from "../../types/graphql";

const locationFactory = Factory.define<Location>(
  ({ sequence, params, afterBuild, associations }) => {
    const barcode = `STO-${padStart(String(sequence), 3, "0")}`;

    const location: Location = {
      id: sequence,
      barcode,
      name: params.name ?? `Location ${sequence}`,
      customName: params.customName ?? null,
      address: params.address ?? null,
      children: params.children ?? [],
      stored: params.stored ?? [],
      size: null,
      direction: params.direction ?? null,
      parent: params.parent == null ? null : (params.parent as LinkedLocation),
    };

    if (params.size) {
      location.size = params.size as Size;
    }

    return location;
  }
);
export default locationFactory;

/**
 * As items contain a reference to their location, and the location can contain references to its items,
 * {@link cloneDeep} is used in here to avoid type errors when items are json stringified
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value}
 */
export const locationItemFactory = Factory.define<StoredItem>(
  ({ sequence, params, associations }) => {
    const locationItem: StoredItem = {
      barcode: `STAN-${sequence + 1000}`,
      location: locationFactory.build(),
      address: params.address ?? null,
    };

    if (associations.location) {
      locationItem.location = cloneDeep(associations.location) as Location;
    }

    return locationItem;
  }
);

export function buildLinkedLocation(location: Location): LinkedLocation {
  return {
    __typename: "LinkedLocation",
    barcode: location.barcode,
    name: location.name,
    customName: location.customName,
    address: location.address,
  };
}
