import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import LocationSearch from "../components/LocationSearch";
import StripyCard, { StripyCardDetail } from "../components/StripyCard";
import Heading from "../components/Heading";
import PinkButton from "../components/buttons/PinkButton";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../components/Modal";
import WhiteButton from "../components/buttons/WhiteButton";
import BinIcon from "../components/icons/BinIcon";
import StyledLink from "../components/StyledLink";
import ItemsList from "./location/ItemsList";
import ItemsGrid from "./location/ItemsGrid";
import Success from "../components/notifications/Success";
import EditableText from "../components/EditableText";
import { setLocationCustomName } from "../lib/services/locationService";
import Warning from "../components/notifications/Warning";
import { toast } from "react-toastify";
import {
  addressToLocationAddress,
  buildOrderedAddresses,
  findNextAvailableAddress,
} from "../lib/helpers/locationHelper";
import { Authenticated, Unauthenticated } from "../components/Authenticated";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { LocationMatchParams, LocationSearchParams } from "../types/stan";
import {
  LabwareFieldsFragment,
  LocationFieldsFragment,
  Maybe,
} from "../types/sdk";
import { useMachine } from "@xstate/react";
import { StoredItemFragment } from "../lib/machines/locations/locationMachineTypes";
import createLocationMachine from "../lib/machines/locations/locationMachine";
import { isAwaitingLabwareState } from "./Store";
import LabwareAwaitingStorage from "./location/LabwareAwaitingStorage";
import warningToast from "../components/notifications/WarningToast";

/**
 * The different ways of displaying stored items
 */
enum ViewType {
  GRID,
  LIST,
}

type LocationParentContextType = {
  location: LocationFieldsFragment;
  locationAddresses: Map<string, number>;
  addressToItemMap: Map<string, StoredItemFragment>;
  storeBarcode: (barcode: string, address?: string) => void;
  unstoreBarcode: (barcode: string) => void;
  selectedAddress: Maybe<string>;
  setSelectedAddress: (address: string) => void;
  labwareBarcodeToAddressMap: Map<string, string>;
  storeBarcodes: (storeData: { barcode: string; address: string }[]) => void;
};

export const LocationParentContext = React.createContext<
  Maybe<LocationParentContextType>
>(null);

interface LocationProps extends RouteComponentProps<LocationMatchParams> {
  storageLocation: LocationFieldsFragment;
  locationSearchParams: Maybe<LocationSearchParams>;
}

const Location: React.FC<LocationProps> = ({
  storageLocation,
  locationSearchParams,
  match,
}) => {
  const locationObject = useLocation();
  const [awaitingLabwares, setAwaitingLabwares] = useState<
    LabwareFieldsFragment[]
  >([]);

  const addInProgressForAwaitingLabwares = React.useRef<string[]>([]);

  React.useEffect(() => {
    if (locationObject.state && isAwaitingLabwareState(locationObject.state)) {
      setAwaitingLabwares(locationObject.state.awaitingLabwares);
    }
  }, [locationObject.state]);

  const [current, send] = useMachine(() => {
    // Create all the possible addresses for this location if it has a size.
    const locationAddresses: Map<string, number> =
      storageLocation.size && storageLocation.direction
        ? buildOrderedAddresses(storageLocation.size, storageLocation.direction)
        : new Map<string, number>();

    // Create a map of location address to item
    const addressToItemMap = new Map<string, StoredItemFragment>();
    storageLocation.stored.forEach((storedItem) => {
      if (storedItem.address) {
        addressToItemMap.set(storedItem.address, storedItem);
      }
    });

    // Get the first selected address (which is the first empty address)
    const selectedAddresses = findNextAvailableAddress({
      locationAddresses: locationAddresses,
      addressToItemMap: addressToItemMap,
    });

    const selectedAddress =
      selectedAddresses.length > 0 ? selectedAddresses[0] : undefined;
    return createLocationMachine({
      context: {
        location: storageLocation,
        locationSearchParams,
        locationAddresses,
        addressToItemMap,
        selectedAddress,
      },
    });
  });

  const {
    location,
    locationAddresses,
    successMessage,
    errorMessage,
    serverError,
    addressToItemMap,
    selectedAddress,
  } = current.context;

  const locationHasGrid = !!location.size;

  /**
   * Should the page be displaying the grid or list view of the items
   */
  const currentViewType = locationHasGrid ? ViewType.GRID : ViewType.LIST;

  /**
   * Is the "Empty Location" modal open
   */
  const [emptyLocationModalOpen, setEmptyLocationModalOpen] = useState(false);

  /**
   * Show a toast notification when success message changes (and isn't null)
   */
  useEffect(() => {
    if (successMessage) {
      if (addInProgressForAwaitingLabwares.current.length > 0) {
        if (
          addInProgressForAwaitingLabwares.current.length ===
          awaitingLabwares.length
        ) {
          setAwaitingLabwares([]);
        } else {
          //Remove added labware from awaiting storage
          const newLabwareList = [...awaitingLabwares].splice(
            awaitingLabwares.findIndex(
              (labware) =>
                labware.barcode === addInProgressForAwaitingLabwares.current[0]
            ),
            1
          );
          setAwaitingLabwares(newLabwareList);
        }
      }
      addInProgressForAwaitingLabwares.current = [];
      const SuccessToast = () => {
        return <Success message={successMessage} />;
      };

      toast(<SuccessToast />, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }, [successMessage]);

  /**
   * Show a toast notification when error message changes (and isn't null)
   */
  useEffect(() => {
    addInProgressForAwaitingLabwares.current = [];
    if (errorMessage) {
      warningToast({
        message: errorMessage,
        error: serverError,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      /*const WarningToast = () => (
        <Warning message={errorMessage} error={serverError} />
      );

      toast(<WarningToast />, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: true,
      });*/
    }
  }, [errorMessage, serverError]);

  /**
   * Event handler for the editable custom name
   * @param newCustomName the new custom name of the location
   */
  const onCustomNameChange = async (newCustomName: string) => {
    try {
      const updatedLocation = await setLocationCustomName(
        location.barcode,
        newCustomName
      );
      send({ type: "UPDATE_LOCATION", location: updatedLocation });
      return newCustomName;
    } catch (e) {
      throw new Error("Failed to update Location");
    }
  };

  const labwareBarcodeToAddressMap: Map<string, string> = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of location.stored) {
      if (
        item.address &&
        item.barcode === locationSearchParams?.labwareBarcode
      ) {
        map.set(item.barcode, item.address);
      }
    }
    return map;
  }, [location, locationSearchParams?.labwareBarcode]);

  const locationParentContext: LocationParentContextType = useMemo(
    () => ({
      addressToItemMap,
      location,
      locationAddresses,
      labwareBarcodeToAddressMap,
      selectedAddress,
      storeBarcode: (barcode, address) =>
        send({ type: "STORE_BARCODE", barcode, address }),
      unstoreBarcode: (barcode) => send({ type: "UNSTORE_BARCODE", barcode }),
      setSelectedAddress: (address) =>
        send({ type: "SET_SELECTED_ADDRESS", address }),
      storeBarcodes: (storeData: { barcode: string; address: string }[]) =>
        send({ type: "STORE_BARCODES", data: storeData }),
    }),
    [
      addressToItemMap,
      location,
      locationAddresses,
      labwareBarcodeToAddressMap,
      selectedAddress,
      send,
    ]
  );

  const addLabware = (labware: LabwareFieldsFragment) => {
    if (!selectedAddress) {
      return;
    }
    addInProgressForAwaitingLabwares.current = [labware.barcode];
    send({ type: "STORE_BARCODE", barcode: labware.barcode });
  };

  const addLabwares = (awaitingLabwares: LabwareFieldsFragment[]) => {
    // Get as many consecutive empty addresses equal to number of labwares awaiting storage
    const nextNumAvailableAddresses = findNextAvailableAddress({
      locationAddresses: locationAddresses,
      addressToItemMap: addressToItemMap,
      minimumAddress: selectedAddress,
      numAddresses: awaitingLabwares.length,
    });
    debugger;
    if (nextNumAvailableAddresses.length !== awaitingLabwares.length) {
      warningToast({
        message:
          "Not enough consecutive free addresses available to store all labwares",
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      return;
    }
    addInProgressForAwaitingLabwares.current = awaitingLabwares.map(
      (labware) => labware.barcode
    );
    const storeData = awaitingLabwares.map((labware, indx) => {
      return {
        barcode: labware.barcode,
        address: nextNumAvailableAddresses[indx],
      };
    });
    send({ type: "STORE_BARCODES", data: storeData });
  };

  const showLocation =
    ["ready", "updating"].some((activeState) => current.matches(activeState)) &&
    !!location;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Store</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {labwareBarcodeToAddressMap &&
            Array.from(labwareBarcodeToAddressMap.keys()).map(
              (labwareBarcode) => (
                <Success
                  className="mb-5"
                  key={labwareBarcode}
                  message={`Labware found`}
                >
                  Labware <span className="font-bold">{labwareBarcode}</span> is
                  in address{" "}
                  <span className="font-bold">
                    {location.size && location.direction
                      ? addressToLocationAddress(
                          labwareBarcodeToAddressMap.get(labwareBarcode) ?? "",
                          location.size,
                          location.direction
                        )
                      : labwareBarcodeToAddressMap.get(labwareBarcode)}
                  </span>
                </Success>
              )
            )}

          {current.matches("notFound") && (
            <Warning
              message={`Location ${match.params.locationBarcode} could not be found`}
            />
          )}

          <LocationSearch />

          {showLocation && (
            <>
              <StripyCard
                heading={
                  <Heading level={3} showBorder={false}>
                    {
                      <>
                        <Authenticated>
                          <EditableText
                            onChange={onCustomNameChange}
                            defaultValue={location.customName || ""}
                          >
                            {location.customName || location.barcode}
                          </EditableText>
                        </Authenticated>

                        <Unauthenticated>
                          {location.customName || location.barcode}
                        </Unauthenticated>
                      </>
                    }
                  </Heading>
                }
                description={location.barcode}
              >
                <StripyCardDetail term={"Name"}>
                  {location.fixedName ?? <span className="italic">None</span>}
                </StripyCardDetail>

                {location.parent && (
                  <StripyCardDetail term={"Parent"}>
                    <StyledLink to={`/locations/${location.parent.barcode}`}>
                      {location.parent.customName ?? location.parent.barcode}
                    </StyledLink>
                  </StripyCardDetail>
                )}

                {location.size && (
                  <StripyCardDetail term={"Size"}>
                    <span className="font-semibold">
                      {location.size.numRows}
                    </span>{" "}
                    row(s) and{" "}
                    <span className="font-semibold">
                      {location.size.numColumns}
                    </span>{" "}
                    column(s)
                  </StripyCardDetail>
                )}

                {location.children.length > 0 && (
                  <StripyCardDetail term={"Children"}>
                    <ul className="list-disc list-inside">
                      {location.children.map((child) => {
                        return (
                          <li key={child.barcode}>
                            <StyledLink to={`/locations/${child.barcode}`}>
                              {child.customName ??
                                child.fixedName ??
                                child.barcode}
                            </StyledLink>
                          </li>
                        );
                      })}
                    </ul>
                  </StripyCardDetail>
                )}

                {location.children.length === 0 && (
                  <StripyCardDetail term={"Number of Stored Items"}>
                    <span
                      data-testid={"storedItemsCount"}
                      className="font-semibold"
                    >
                      {location.stored.length}
                    </span>
                  </StripyCardDetail>
                )}

                {location.direction && (
                  <StripyCardDetail term={"Layout"}>
                    <span className="font-semibold">{location.direction}</span>
                  </StripyCardDetail>
                )}
              </StripyCard>

              {location.children.length === 0 && (
                <>
                  <Heading className="mt-10 mb-5" level={2}>
                    Stored Items
                  </Heading>

                  {awaitingLabwares.length > 0 && (
                    <LabwareAwaitingStorage
                      labwares={awaitingLabwares}
                      addEnabled={selectedAddress !== undefined}
                      onAddAllLabware={addLabwares}
                      onAddLabware={addLabware}
                    />
                  )}

                  <LocationParentContext.Provider value={locationParentContext}>
                    {currentViewType === ViewType.LIST && <ItemsList />}
                    {locationHasGrid && currentViewType === ViewType.GRID && (
                      <ItemsGrid />
                    )}
                  </LocationParentContext.Provider>

                  <Authenticated>
                    <div className="my-5 flex flex-row items-center justify-end">
                      <PinkButton
                        onClick={() => setEmptyLocationModalOpen(true)}
                      >
                        <BinIcon className="inline-block h-5 w-5 -ml-1 mr-2" />
                        Empty Location
                      </PinkButton>
                    </div>

                    <Modal show={emptyLocationModalOpen}>
                      <ModalHeader>Remove All Labware</ModalHeader>
                      <ModalBody>
                        <p className="text-sm text-gray-700">
                          Are you sure you want to remove all labware from{" "}
                          <span className="font-semibold">
                            {location.customName ??
                              location.fixedName ??
                              location.barcode}
                          </span>
                          ?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <PinkButton
                          className="sm:ml-3"
                          onClick={() => {
                            send({ type: "EMPTY_LOCATION" });
                            setEmptyLocationModalOpen(false);
                          }}
                        >
                          Remove All Labware
                        </PinkButton>
                        <WhiteButton
                          className="sm:ml-3 mt-1"
                          onClick={() => setEmptyLocationModalOpen(false)}
                        >
                          Close
                        </WhiteButton>
                      </ModalFooter>
                    </Modal>
                  </Authenticated>
                </>
              )}
            </>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Location;
