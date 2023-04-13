import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import LocationSearch from '../components/LocationSearch';
import StripyCard, { StripyCardDetail } from '../components/StripyCard';
import Heading from '../components/Heading';
import PinkButton from '../components/buttons/PinkButton';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../components/Modal';
import WhiteButton from '../components/buttons/WhiteButton';
import BinIcon from '../components/icons/BinIcon';
import StyledLink from '../components/StyledLink';
import ItemsList from './location/ItemsList';
import ItemsGrid from './location/ItemsGrid';
import Success from '../components/notifications/Success';
import EditableText from '../components/EditableText';
import { getLocation, setLocationCustomName, transferItems } from '../lib/services/locationService';
import Warning from '../components/notifications/Warning';
import { toast } from 'react-toastify';
import {
  addressToLocationAddress,
  buildOrderedAddresses,
  findNextAvailableAddress
} from '../lib/helpers/locationHelper';
import { Authenticated, Unauthenticated } from '../components/Authenticated';
import { RouteComponentProps } from 'react-router-dom';
import { extractServerErrors, LocationMatchParams, LocationSearchParams } from '../types/stan';
import { LocationFieldsFragment, Maybe, StoreInput } from '../types/sdk';
import { useMachine } from '@xstate/react';
import { StoredItemFragment } from '../lib/machines/locations/locationMachineTypes';
import createLocationMachine from '../lib/machines/locations/locationMachine';
import { awaitingStorageCheckOnExit, getAwaitingLabwaresFromSession, LabwareAwaitingStorageInfo } from './Store';
import LabwareAwaitingStorage from './location/LabwareAwaitingStorage';
import warningToast from '../components/notifications/WarningToast';
import PromptOnLeave from '../components/notifications/PromptOnLeave';
import LabelCopyButton from '../components/LabelCopyButton';
import { Input } from '../components/forms/Input';
import Label from '../components/forms/Label';
import MutedText from '../components/MutedText';
import PasteIcon from '../components/icons/PasteIcon';
import BlueButton from '../components/buttons/BlueButton';
import { ClientError } from 'graphql-request';
import { stanCore } from '../lib/sdk';

/**
 * The different ways of displaying stored items
 */
enum ViewType {
  GRID,
  LIST
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

export const LocationParentContext = React.createContext<Maybe<LocationParentContextType>>(null);

interface LocationProps extends RouteComponentProps<LocationMatchParams> {
  storageLocation: LocationFieldsFragment;
  locationSearchParams: Maybe<LocationSearchParams>;
}

const Location: React.FC<LocationProps> = ({ storageLocation, locationSearchParams, match }) => {
  const locationMachine = React.useMemo(() => {
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
      addressToItemMap: addressToItemMap
    });

    const selectedAddress = selectedAddresses.length > 0 ? selectedAddresses[0] : undefined;
    return createLocationMachine({
      context: {
        location: storageLocation,
        locationSearchParams,
        locationAddresses,
        addressToItemMap,
        selectedAddress
      }
    });
  }, [storageLocation, locationSearchParams]);
  //Custom hook to retain the updated labware state
  const [current, send] = useMachine(locationMachine);

  const { location, locationAddresses, successMessage, errorMessage, serverError, addressToItemMap, selectedAddress } =
    current.context;

  const locationHasGrid = !!location.size;

  /**
   * Should the page be displaying the grid or list view of the items
   */
  const currentViewType = locationHasGrid ? ViewType.GRID : ViewType.LIST;

  /**
   *Labware list awaiting to be stored
   */
  const [awaitingLabwares, setAwaitingLabwares] = useState<LabwareAwaitingStorageInfo[]>([]);

  /**
   * Is the "Empty Location" modal open
   */
  const [emptyLocationModalOpen, setEmptyLocationModalOpen] = useState(false);

  /**
   * Labwares selected for store operation implicitly indicating a store action in progress
   */
  const labwaresAddInProgress = React.useRef<LabwareAwaitingStorageInfo[]>([]);

  /**
   * Location barcode of source from which items to be transferred from
   */
  const [transferSourceLocation, setTransferSourceLocation] = React.useState<LocationFieldsFragment | undefined>(
    undefined
  );
  const [transferSourceInputText, setTransferSourceInputText] = React.useState<string>('');
  /**
   * Location barcode of source from which items to be transferred from
   */
  const [sourceLocationError, setSourceLocationError] = React.useState<string>('');

  /**
   * Full path for the given storage location
   * The root is the first element, and the current storage location is the last element
     For example, if there is a box in a drawer in a freezer, the freezer will be first and the box will be last
   */
  const [storagePath, setStoragePath] = React.useState<string>('');

  const transferInputRef = React.useRef<HTMLInputElement>(null);

  /***When component loads, fill awaitingLabwares from sessionStorage, if any**/
  React.useEffect(() => {
    setAwaitingLabwares(getAwaitingLabwaresFromSession());
  }, []);

  React.useEffect(() => {
    async function setPathForLocation() {
      const response = await stanCore.FindStoragePath({ locationBarcode: storageLocation.barcode });
      /**Generate path only if the parent hierarchy is more than one level, as the immediate parent information will
       * always be displayed
       */
      if (response.storagePath.length <= 1) {
        setStoragePath('');
      }
      /**The path name will be searched in the following order depending on which is available
       fixedName -> customName -> address -> barcode
       */
      const path =
        response.storagePath.length > 1
          ? response.storagePath
              .map((elem) => elem.fixedName ?? elem.customName ?? elem.address ?? elem.barcode)
              .join(' -> ')
          : '';
      setStoragePath(path);
    }
    setPathForLocation();
  }, [storageLocation]);

  /**Leaving to another page from a prompt dialog, so clear the sessionStorage before leaving this page**/
  const onLeave = React.useCallback(() => {
    sessionStorage.removeItem('awaitingLabwares');
  }, []);

  /**
   * Show a toast notification when success message changes (and isn't null)
   * If this is a store operation for awaiting labwares, update the awaitingLabwares list
   */
  useEffect(() => {
    if (successMessage) {
      /**This is a store operation for labwares in waiting, so remove all the added labwares from the awaiting list**/
      const prevAwaitingLabwares = getAwaitingLabwaresFromSession();
      let currAwaitingLabwares: LabwareAwaitingStorageInfo[] = [];
      if (labwaresAddInProgress.current.length > 0) {
        if (labwaresAddInProgress.current.length !== prevAwaitingLabwares.length) {
          /**This is storing an individual awaiting labware operation, so remove that labware**/
          const indx = prevAwaitingLabwares.findIndex(
            (labware) => labware.barcode === labwaresAddInProgress.current[0].barcode
          );
          currAwaitingLabwares = [...prevAwaitingLabwares];
          currAwaitingLabwares.splice(indx, 1);
        }
        setAwaitingLabwares(currAwaitingLabwares);
        if (currAwaitingLabwares.length > 0) {
          //Update sessionStorage if any awaitingLabwares
          sessionStorage.setItem(
            'awaitingLabwares',
            currAwaitingLabwares
              .map(
                (labware) =>
                  `${labware.barcode},${labware.labwareType},${labware.externalIdentifier},${labware.donor},${labware.tissueType},${labware.spatialLocation},${labware.replicate}`
              )
              .join(',')
          );
          //Otherwise remove it from sessionStorage
        } else sessionStorage.removeItem('awaitingLabwares');
      }
      //Store operation is complete, so empty the list
      labwaresAddInProgress.current = [];

      const SuccessToast = () => {
        return <Success message={successMessage} />;
      };

      toast(<SuccessToast />, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: true
      });
    }
  }, [successMessage, setAwaitingLabwares]);

  /**
   * Show a toast notification when error message changes (and isn't null)
   */
  useEffect(() => {
    if (errorMessage) {
      warningToast({
        message: errorMessage,
        error: serverError,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
      labwaresAddInProgress.current = [];
    }
  }, [errorMessage, serverError]);

  /**
   * Event handler for the editable custom name
   * @param newCustomName the new custom name of the location
   */
  const onCustomNameChange = async (newCustomName: string) => {
    try {
      const updatedLocation = await setLocationCustomName(location.barcode, newCustomName);
      send({ type: 'UPDATE_LOCATION', location: updatedLocation });
      return newCustomName;
    } catch (e) {
      throw new Error('Failed to update Location');
    }
  };

  const labwareBarcodeToAddressMap: Map<string, string> = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of location.stored) {
      if (item.address && item.barcode === locationSearchParams?.labwareBarcode) {
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
      storeBarcode: (barcode, address) => send({ type: 'STORE_BARCODE', barcode, address }),
      unstoreBarcode: (barcode) => send({ type: 'UNSTORE_BARCODE', barcode }),
      setSelectedAddress: (address) => send({ type: 'SET_SELECTED_ADDRESS', address }),
      storeBarcodes: (storeData: StoreInput[]) => send({ type: 'STORE', data: storeData })
    }),
    [addressToItemMap, location, locationAddresses, labwareBarcodeToAddressMap, selectedAddress, send]
  );

  /***
   * Store all awaiting labwares - handles store all labwares  or one labware at a time
   */
  const storeLabwares = React.useCallback(
    (awaitingLabwares: LabwareAwaitingStorageInfo[]) => {
      if (!selectedAddress && currentViewType === ViewType.GRID) {
        return;
      }
      labwaresAddInProgress.current = awaitingLabwares;
      /**Handle storing of one labware at a time*/
      if (awaitingLabwares.length === 1) {
        send({
          type: 'STORE_BARCODE',
          barcode: awaitingLabwares[0].barcode,
          address: selectedAddress ?? undefined
        });
        return;
      }

      /**Handle storing of all labwares operation**/
      let nextAvailableAddresses: string[] | undefined = undefined;
      if (currentViewType === ViewType.GRID) {
        /** Get as many consecutive empty addresses equal to number of labwares awaiting storage**/
        nextAvailableAddresses = findNextAvailableAddress({
          locationAddresses: locationAddresses,
          addressToItemMap: addressToItemMap,
          minimumAddress: selectedAddress,
          numAddresses: awaitingLabwares.length
        });
        /**Not enough consecutive empty addresses to store the labwares**/
        if (nextAvailableAddresses.length !== awaitingLabwares.length) {
          warningToast({
            message: 'Not enough consecutive free addresses available to store all labwares',
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000
          });
          return;
        }
      }
      const storeData = awaitingLabwares.map((labware, indx) => {
        return {
          barcode: labware.barcode,
          address: nextAvailableAddresses ? nextAvailableAddresses[indx] : undefined
        };
      });
      labwaresAddInProgress.current = awaitingLabwares;
      send({ type: 'STORE', data: storeData });
    },
    [addressToItemMap, locationAddresses, selectedAddress, send, currentViewType]
  );

  const showLocation = ['ready', 'updating'].some((activeState) => current.matches(activeState)) && !!location;

  const handleSourceBarcodeEnter = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement> | string) => {
      let locationBarcode = '';
      if (typeof e === 'string') {
        locationBarcode = e;
      } else {
        if (e.key !== 'Enter') return;
        locationBarcode = e.currentTarget.value;
      }
      if (!locationBarcode) return;
      async function fetchLabwareInLocation(locationBarcode: string) {
        try {
          const labware = await getLocation(locationBarcode);
          setTransferSourceLocation(labware);
        } catch (e) {
          setSourceLocationError(`No location with barcode ${locationBarcode} exists`);
          setTransferSourceLocation(undefined);
        }
      }
      fetchLabwareInLocation(locationBarcode);
    },
    [setSourceLocationError, setTransferSourceLocation]
  );

  const handlePaste = React.useCallback(() => {
    const pasteText = async () => {
      await navigator.clipboard.readText().then((text) => {
        // Strip out hidden chars \r \n
        text = text.replace(/[\r\n]/g, '');
        setTransferSourceInputText(text);
      });
    };
    pasteText();
    transferInputRef.current?.focus();
  }, [setTransferSourceInputText]);

  const handleTransfer = React.useCallback(() => {
    if (!transferSourceLocation) return;
    async function performTransferAction(
      sourceLocation: LocationFieldsFragment,
      destinationLocation: LocationFieldsFragment
    ) {
      try {
        const updatedLocation = await transferItems(sourceLocation.barcode, destinationLocation.barcode);
        if (updatedLocation) {
          send({ type: 'UPDATE_LOCATION', location: updatedLocation });
          toast(<Success message={`All items transferred from ${sourceLocation.barcode}.`} />, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 4000,
            hideProgressBar: true
          });
        } else {
          warningToast({
            message: `Cannot transfer items from ${sourceLocation.barcode}.`,
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000
          });
        }
      } catch (e) {
        warningToast({
          message: extractServerErrors(e as ClientError).message ?? 'Error in Transferring items.',
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000
        });
      }
    }
    performTransferAction(transferSourceLocation, location);
  }, [transferSourceLocation, location, send]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Store</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {labwareBarcodeToAddressMap &&
            Array.from(labwareBarcodeToAddressMap.keys()).map((labwareBarcode) => (
              <Success className="mb-5" key={labwareBarcode} message={`Labware found`}>
                Labware <span className="font-bold">{labwareBarcode}</span> is in address{' '}
                <span className="font-bold">
                  {location.size && location.direction
                    ? addressToLocationAddress(
                        labwareBarcodeToAddressMap.get(labwareBarcode) ?? '',
                        location.size,
                        location.direction
                      )
                    : labwareBarcodeToAddressMap.get(labwareBarcode)}
                </span>
              </Success>
            ))}
          {current.matches('notFound') && (
            <Warning message={`Location ${match.params.locationBarcode} could not be found`} />
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
                          <EditableText onChange={onCustomNameChange} defaultValue={location.customName || ''}>
                            {location.customName || location.barcode}
                          </EditableText>
                        </Authenticated>

                        <Unauthenticated>{location.customName || location.barcode}</Unauthenticated>
                      </>
                    }
                  </Heading>
                }
                description={
                  <>
                    {location.barcode}
                    <LabelCopyButton labels={[location.barcode]} />
                  </>
                }
              >
                <StripyCardDetail term={'Name'}>
                  {location.fixedName ?? <span className="italic">None</span>}
                </StripyCardDetail>

                {storagePath.length > 0 && (
                  <StripyCardDetail term={'Path'}>
                    <span>{storagePath}</span>
                  </StripyCardDetail>
                )}
                {location.parent && (
                  <StripyCardDetail term={'Parent'}>
                    <StyledLink
                      to={{
                        pathname: `/locations/${location.parent.barcode}`,
                        state: awaitingLabwares ? { awaitingLabwares: awaitingLabwares } : {}
                      }}
                    >
                      {location.parent.customName ?? location.parent.barcode}
                    </StyledLink>
                  </StripyCardDetail>
                )}

                {location.size && (
                  <StripyCardDetail term={'Size'}>
                    <span className="font-semibold">{location.size.numRows}</span> row(s) and{' '}
                    <span className="font-semibold">{location.size.numColumns}</span> column(s)
                  </StripyCardDetail>
                )}

                {location.children.length > 0 && (
                  <StripyCardDetail term={'Children'}>
                    <ul className="list-disc list-inside">
                      {location.children.map((child) => {
                        return (
                          <li key={child.barcode}>
                            <StyledLink
                              to={{
                                pathname: `/locations/${child.barcode}`,
                                state: awaitingLabwares ? { awaitingLabwares: awaitingLabwares } : {}
                              }}
                            >
                              {child.customName ?? child.fixedName ?? child.barcode}
                            </StyledLink>
                          </li>
                        );
                      })}
                    </ul>
                  </StripyCardDetail>
                )}

                {location.children.length === 0 && (
                  <StripyCardDetail term={'Number of Stored Items'}>
                    <span data-testid={'storedItemsCount'} className="font-semibold">
                      {location.stored.length}
                    </span>
                  </StripyCardDetail>
                )}

                {location.direction && (
                  <StripyCardDetail term={'Layout'}>
                    <span className="font-semibold">{location.direction}</span>
                  </StripyCardDetail>
                )}
                {location.children.length === 0 && (
                  <StripyCardDetail term={'Transfer'}>
                    <Heading className=" mb-5" level={3}>
                      Transfer items from location
                    </Heading>
                    <div className="grid grid-cols-2 gap-x-8">
                      <div className="flex flex-col">
                        <div className="flex flex-col gap-y-4">
                          <Label className="font-semibold" htmlFor={'source_barcode'} name={'Source Barcode:'} />
                          <div className="flex flex-row">
                            <Input
                              ref={transferInputRef}
                              className={' h-9 p-2 w-full border-2 border-gray-200'}
                              id={'source_barcode'}
                              onInput={(e) => {
                                setTransferSourceInputText(e.currentTarget.value);
                              }}
                              onKeyDown={(e) => {
                                setSourceLocationError('');
                                setTransferSourceInputText(e.currentTarget.value);
                                handleSourceBarcodeEnter(e);
                              }}
                              value={transferSourceInputText}
                            />
                            <button
                              id="pasteButton"
                              className="px-2 py-2 flex items-center rounded-r-md border-l-0 border text-white bg-sdb-400 focus:outline-none"
                              onClick={() => {
                                handlePaste();
                              }}
                              type={'button'}
                            >
                              <PasteIcon className="block h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <MutedText>Type barcode and press 'Enter' or Paste</MutedText>
                      </div>
                      {transferSourceLocation && (
                        <div className="flex flex-col gap-y-4 content-center items-center ">
                          <div className="font-semibold"> Description </div>
                          <div data-testid={'transfer-source-description'}> {transferSourceLocation.customName} </div>
                        </div>
                      )}
                      {sourceLocationError && (
                        <div className="flex content-center items-center justify-center">
                          <Warning className="font-semibold"> {sourceLocationError} </Warning>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row justify-end space-x-2">
                      <BlueButton disabled={transferSourceLocation === undefined} onClick={handleTransfer}>
                        Transfer
                      </BlueButton>
                    </div>
                  </StripyCardDetail>
                )}
              </StripyCard>

              {location.children.length === 0 ? (
                <>
                  <Heading className="mt-10 mb-5" level={2}>
                    Stored Items
                  </Heading>

                  {awaitingLabwares.length > 0 && (
                    <LabwareAwaitingStorage
                      labwares={awaitingLabwares}
                      storeEnabled={
                        currentViewType === ViewType.LIST ||
                        (currentViewType === ViewType.GRID && selectedAddress !== undefined)
                      }
                      onStoreLabwares={storeLabwares}
                    />
                  )}
                  <LocationParentContext.Provider value={locationParentContext}>
                    {currentViewType === ViewType.LIST && <ItemsList />}
                    {locationHasGrid && currentViewType === ViewType.GRID && <ItemsGrid />}
                  </LocationParentContext.Provider>

                  <Authenticated>
                    <div className="my-5 flex flex-row items-center justify-end">
                      <PinkButton onClick={() => setEmptyLocationModalOpen(true)}>
                        <BinIcon className="inline-block h-5 w-5 -ml-1 mr-2" />
                        Empty Location
                      </PinkButton>
                    </div>

                    <Modal show={emptyLocationModalOpen}>
                      <ModalHeader>Remove All Labware</ModalHeader>
                      <ModalBody>
                        <p className="text-sm text-gray-700">
                          Are you sure you want to remove all labware from{' '}
                          <span className="font-semibold">
                            {location.customName ?? location.fixedName ?? location.barcode}
                          </span>
                          ?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <PinkButton
                          className="sm:ml-3"
                          onClick={() => {
                            send({ type: 'EMPTY_LOCATION' });
                            setEmptyLocationModalOpen(false);
                          }}
                        >
                          Remove All Labware
                        </PinkButton>
                        <WhiteButton className="sm:ml-3 mt-1" onClick={() => setEmptyLocationModalOpen(false)}>
                          Close
                        </WhiteButton>
                      </ModalFooter>
                    </Modal>
                  </Authenticated>
                </>
              ) : (
                <>
                  {awaitingLabwares.length > 0 && (
                    <LabwareAwaitingStorage
                      labwares={awaitingLabwares}
                      storeEnabled={false}
                      onStoreLabwares={() => {}}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </AppShell.Main>
      <PromptOnLeave
        when={awaitingLabwares.length > 0}
        messageHandler={awaitingStorageCheckOnExit}
        message={'You have labwares that are not stored. Are you sure you want to leave?'}
        onPromptLeave={onLeave}
      />
    </AppShell>
  );
};

export default Location;
