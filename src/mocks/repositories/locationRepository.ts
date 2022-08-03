import { GridDirection, Location, Maybe, StoredItem, StoreInput } from '../../types/sdk';
import locationFactory, { buildLinkedLocation, locationItemFactory } from '../../lib/factories/locationFactory';
import { cloneDeep } from 'lodash';

interface Repository<T> {
  save<S extends T>(entity: S): void;
}

/**
 * Quick and dirty repository and some location seeds to make mocking the API easier
 */
class LocationRepository implements Repository<Location> {
  private locations: Map<string, Location> = new Map();

  save<S extends Location>(entity: S): void {
    this.locations.set(entity.barcode, entity);
  }

  findByBarcode(barcode: string): Maybe<Location> {
    const location = this.locations.get(barcode);
    return location ? location : null;
  }

  findByLabwareBarcode(barcodes: Array<string>): Array<StoredItem> {
    return Array.from(this.locations.values()).reduce<Array<StoredItem>>((memo, location) => {
      const matchingItems = location.stored.filter((item) => barcodes.includes(item.barcode));
      memo.push(...matchingItems);
      return memo;
    }, []);
  }

  storeBarcode(barcode: string, locationBarcode: string, address?: string | undefined | null): StoredItem {
    const newLocation = this.locations.get(locationBarcode);
    if (!newLocation) {
      throw new Error(`Location with barcode ${locationBarcode} not found`);
    }
    const oldLocation = Array.from(this.locations.values()).find((location) => {
      return location.stored.some((item) => item.barcode === barcode);
    });
    if (oldLocation) {
      oldLocation.stored = oldLocation.stored.filter((item) => item.barcode !== barcode);
    }
    const newItem: StoredItem = {
      barcode,
      address,
      location: newLocation
    };

    newLocation.stored.push(newItem);
    newItem.location = cloneDeep(newLocation);
    return newItem;
  }

  store(store: StoreInput[] | StoreInput, locationBarcode: string): Location {
    const newLocation = this.locations.get(locationBarcode);
    if (!newLocation) {
      throw new Error(`Location with barcode ${locationBarcode} not found`);
    }
    const storedItems = Array.isArray(store) ? store : [store];
    storedItems.forEach((storeItem) => {
      const oldLocation = Array.from(this.locations.values()).find((location) => {
        return location.stored.some((item) => item.barcode === storeItem.barcode);
      });
      if (oldLocation) {
        oldLocation.stored = oldLocation.stored.filter((item) => item.barcode !== storeItem.barcode);
      }
    });
    storedItems.forEach((storeItem) => {
      const newItem: StoredItem = {
        barcode: storeItem.barcode,
        address: storeItem.address,
        location: newLocation
      };

      newLocation.stored.push(newItem);
      newItem.location = cloneDeep(newLocation);
    });
    return newLocation;
  }

  unstoreBarcode(barcode: string): Maybe<StoredItem> {
    const location = Array.from(this.locations.values()).find((location) => {
      return location.stored.some((item) => item.barcode === barcode);
    });
    if (!location) {
      return null;
    }

    const item = location.stored.find((item) => item.barcode === barcode) ?? null;

    location.stored = location.stored.filter((item) => item.barcode !== barcode);

    return item;
  }

  empty(locationBarcode: string): number {
    const location = this.findByBarcode(locationBarcode);
    let numUnstored = 0;
    if (location) {
      numUnstored = location.stored.length;
      location.stored = [];
    }
    return numUnstored;
  }
}

const locationRepository = new LocationRepository();

const room: Location = locationFactory.build({ customName: 'Room 1234' });

const freezers: Location[] = [];

for (let i = 1; i <= 3; i++) {
  let freezer = locationFactory.build({
    customName: `Freezer ${i} in Room 1234`,
    parent: buildLinkedLocation(room)
  });
  freezers.push(freezer);
}
room.children = freezers.map(buildLinkedLocation);

const racks: Location[] = [];
freezers.forEach((freezer, index) => {
  for (let i = 1; i <= 3; i++) {
    let rack = locationFactory.build({
      customName: `Rack ${i} in ${freezer.customName}`,
      parent: buildLinkedLocation(freezer)
    });
    racks.push(rack);
  }

  freezer.children = racks.slice(3 * index, 3 * index + 3).map(buildLinkedLocation);
});

const boxes: Location[] = [];
/***
 * Create non-address-based storage location - size has to be undefined.
 * This will only have list view.
 * The storage location are of format STO-011, STO-012...
 ***/
racks.forEach((rack, index) => {
  boxes.push(
    locationFactory.build({
      customName: `Box 1 in ${rack.customName}`,
      direction: GridDirection.RightDown,
      parent: buildLinkedLocation(rack)
    })
  );
  /***
   * Create address-based storage location.
   * This will only have grid view.
   * The storage location are of format STO-021, STO-022..
   ***/
  boxes.push(
    locationFactory.build({
      customName: `Box 2 in ${rack.customName}`,
      size: {
        numRows: 50,
        numColumns: 2
      },
      direction: GridDirection.DownRight,
      parent: buildLinkedLocation(rack)
    })
  );

  boxes.push(
    locationFactory.build({
      customName: `Box 3 in ${rack.customName}`,
      size: {
        numRows: 5,
        numColumns: 5
      },
      direction: GridDirection.RightUp,
      parent: buildLinkedLocation(rack)
    })
  );

  boxes.push(
    locationFactory.build({
      customName: `Box 4 in ${rack.customName}`,
      size: {
        numRows: 5,
        numColumns: 5
      },
      direction: GridDirection.UpRight,
      parent: buildLinkedLocation(rack)
    })
  );

  rack.children = boxes.slice(index * 4, index * 4 + 4).map(buildLinkedLocation);
});

boxes.forEach((box) => {
  const items: StoredItem[] = [];
  items.push(locationItemFactory.build({ address: 'A1' }, { associations: { location: box } }));
  items.push(locationItemFactory.build({ address: 'B2' }, { associations: { location: box } }));
  items.push(locationItemFactory.build({ address: 'C3' }, { associations: { location: box } }));
  items.push(locationItemFactory.build({ address: 'C4' }, { associations: { location: box } }));
  items.push(locationItemFactory.build({ address: 'D5' }, { associations: { location: box } }));
  items.push(locationItemFactory.build(undefined, { associations: { location: box } }));
  box.stored = items;
});

[room, ...freezers, ...racks, ...boxes].forEach((location) => {
  locationRepository.save(location);
});

export { locationRepository };
