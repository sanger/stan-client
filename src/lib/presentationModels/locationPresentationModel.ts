import { MachinePresentationModel } from "./machinePresentationModel";
import {
  LocationContext,
  LocationEvent,
  LocationSchema,
} from "../machines/locations/locationMachineTypes";
import { LocationFieldsFragment, Maybe } from "../../types/graphql";
import { LocationSearchParams } from "../../types/stan";

export default class LocationPresentationModel extends MachinePresentationModel<
  LocationContext,
  LocationSchema,
  LocationEvent
> {
  get locationHasGrid(): boolean {
    return !!this.context.location.size;
  }

  get labwareBarcodeToAddressMap(): Map<string, string> {
    const labwareBarcodeToAddressMap = new Map<string, string>();
    for (const item of this.context.location.stored) {
      if (
        item.address &&
        item.barcode === this.context.locationSearchParams?.labwareBarcode
      ) {
        labwareBarcodeToAddressMap.set(item.barcode, item.address);
      }
    }
    return labwareBarcodeToAddressMap;
  }

  showWarning(): boolean {
    return this.current.matches("notFound");
  }

  showLocation(): boolean {
    return (
      ["ready", "updating"].some((activeState) =>
        this.current.matches(activeState)
      ) && !!this.context.location
    );
  }

  fetchLocation(
    barcode: string,
    locationSearchParams: Maybe<LocationSearchParams>
  ) {
    this.send({
      type: "FETCH_LOCATION",
      barcode,
      locationSearchParams,
    });
  }

  updateLocation(location: LocationFieldsFragment) {
    this.send({
      type: "UPDATE_LOCATION",
      location,
    });
  }

  emptyLocation() {
    this.send({
      type: "EMPTY_LOCATION",
    });
  }

  storeBarcode(barcode: string, address?: string) {
    this.send({
      type: "STORE_BARCODE",
      barcode,
      address,
    });
  }

  unstoreBarcode(barcode: string) {
    this.send({
      type: "UNSTORE_BARCODE",
      barcode,
    });
  }

  setSelectedAddress(address: string) {
    this.send({
      type: "SET_SELECTED_ADDRESS",
      address,
    });
  }
}
