import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { useMachine } from '@xstate/react';
import { createLabwareMachine } from '../../lib/machines/labware/labwareMachine';
import ScanInput from '../scanInput/ScanInput';
import Success from '../notifications/Success';
import Warning from '../notifications/Warning';
import { isFunction } from 'lodash';
import * as Yup from 'yup';

export type LabwareScannerProps = {
  /**
   * The initial list of labwares the scanner should be displaying
   */
  initialLabwares?: LabwareFlaggedFieldsFragment[];

  /**
   * True is the scanner should be locked; false otherwise
   */
  locked?: boolean;

  /**
   * The maximum number of labware the scanner should be able to have scanned in at one time
   */
  limit?: number;

  /**
   * A function to check for problems with new labware because it is added
   */
  labwareCheckFunction?: (
    labwares: LabwareFlaggedFieldsFragment[],
    foundLabware: LabwareFlaggedFieldsFragment
  ) => string[] | Promise<string[]>;

  /**
   * Called when labware is added or removed
   * @param labwares the list of current labwares
   */
  onChange?: (labwares: LabwareFlaggedFieldsFragment[], cleanedOutAddresses?: Map<number, string[]>) => void;

  /**
   * Callback for when a labware is added
   * @param labware the added labware
   */
  onAdd?: (labware: LabwareFlaggedFieldsFragment, cleanedOutAddresses?: Map<number, string[]>) => void;

  /**
   * Callback for when a labware is removed
   * @param labware the removed labware
   * @param index the index of the removed labware
   */
  onRemove?: (labware: LabwareFlaggedFieldsFragment, index: number) => void;

  /**
   * Children can either be a react node (if using the useLabware hook)
   * Or it can be a function that will have the context passed in
   */
  children?: React.ReactNode | ((props: LabwareScannerContextType) => React.ReactNode);

  enableLocationScanner?: boolean;

  /**
   * defaults to false, when set to true labwareMachine runs the FindFlaggedLabware query instead of the FindLabware query.
   */
  enableFlaggedLabwareCheck?: boolean;

  /**
   * defaults to false, when set to true labwareMachine runs the cleanedOutAddresses query
   */
  checkForCleanedOutAddresses?: boolean;

  /**
   * The initial map of cleaned out addresses linked to the initial labwares list
   */
  initCleanedOutAddresses?: Map<number, string[]>;
};

export default function LabwareScanner({
  initialLabwares,
  locked = false,
  limit,
  labwareCheckFunction,
  onChange,
  onAdd,
  onRemove,
  children,
  enableLocationScanner,
  enableFlaggedLabwareCheck = false,
  checkForCleanedOutAddresses = false,
  initCleanedOutAddresses = new Map<number, string[]>()
}: LabwareScannerProps) {
  const slicedInitialLabware = React.useMemo(() => {
    if (!initialLabwares) return [];
    if (limit && initialLabwares.length > limit) {
      return initialLabwares.slice(0, limit);
    } else return initialLabwares;
  }, [initialLabwares, limit]);

  const slicedInitialCleanedOutAddresses = React.useMemo(() => {
    if (
      slicedInitialLabware &&
      slicedInitialLabware.length > 0 &&
      initCleanedOutAddresses.size !== slicedInitialLabware?.length
    ) {
      const cleanedOutAddresses = new Map<number, string[]>([...initCleanedOutAddresses]);
      slicedInitialLabware.forEach((labware) => {
        cleanedOutAddresses.set(labware.id, initCleanedOutAddresses.get(labware.id) || []);
      });
      return cleanedOutAddresses;
    }
    return initCleanedOutAddresses;
  }, [initCleanedOutAddresses, slicedInitialLabware]);

  const labwareMachine = React.useMemo(() => {
    return createLabwareMachine();
  }, []);

  const [current, send, service] = useMachine(labwareMachine, {
    input: {
      labwares: slicedInitialLabware,
      foundLabwareCheck: labwareCheckFunction,
      limit,
      enableFlaggedLabwareCheck,
      currentBarcode: '',
      foundLabware: null,
      removedLabware: null,
      validator: Yup.string().trim().required('Barcode is required'),
      successMessage: null,
      errorMessage: null,
      locationScan: false,
      checkForCleanedOutAddresses,
      cleanedOutAddresses: slicedInitialCleanedOutAddresses,
      areInitialsSet: false
    }
  });

  const {
    labwares,
    removedLabware,
    successMessage,
    errorMessage,
    currentBarcode,
    locationScan,
    cleanedOutAddresses,
    areInitialsSet
  } = current.context;
  /**
   * After transition into the "idle" state, focus the scan input
   */
  const inputRef = useRef<HTMLInputElement>(null);
  const previousLabwareLength = service.getSnapshot().context.labwares.length;
  const prevCleanedOutAddressesLength = service.getSnapshot().context.cleanedOutAddresses.size;
  useEffect(() => {
    const subscription = service.subscribe((observer) => {
      if (observer.matches('idle') && !observer.context.locationScan) {
        inputRef.current?.focus();
      }
      const currentLabwareLength = observer.context.labwares.length;
      const curCleanedOutAddressesLength = observer.context.cleanedOutAddresses.size;
      const labwares = observer.context.labwares;
      if (typeof previousLabwareLength !== 'undefined') {
        if (!checkForCleanedOutAddresses && currentLabwareLength !== previousLabwareLength) {
          onChange?.(labwares);
        }

        //wait until the machine updates cleanedOutAddresses map
        if (checkForCleanedOutAddresses && curCleanedOutAddressesLength !== prevCleanedOutAddressesLength) {
          onChange?.(labwares, cleanedOutAddresses);
        }

        if (currentLabwareLength > previousLabwareLength) {
          onAdd?.(labwares[labwares.length - 1]);
        }

        if (currentLabwareLength < previousLabwareLength) {
          observer.context.removedLabware &&
            onRemove?.(observer.context.removedLabware.labware, observer.context.removedLabware.index);
        }
      }
    });
    return subscription.unsubscribe;
  }, [
    service,
    onChange,
    onAdd,
    onRemove,
    labwares,
    removedLabware,
    previousLabwareLength,
    cleanedOutAddresses,
    prevCleanedOutAddressesLength,
    checkForCleanedOutAddresses
  ]);

  useEffect(() => {
    send(locked ? { type: 'LOCK' } : { type: 'UNLOCK' });
  }, [send, locked]);

  useEffect(() => {
    if (slicedInitialLabware.length > 0 && !areInitialsSet) {
      send({
        type: 'SET_INITIALS',
        labware: slicedInitialLabware,
        cleanedOutAddresses
      });
    }
  }, [send, slicedInitialLabware, cleanedOutAddresses, areInitialsSet]);

  const ctxValue: LabwareScannerContextType = {
    locked: current.matches('locked'),
    labwares: labwares,
    removeLabware: React.useCallback(
      (barcode) => {
        send({ type: 'REMOVE_LABWARE', value: barcode });
      },
      [send]
    ),
    enableFlaggedLabwareCheck,
    cleanedOutAddresses: cleanedOutAddresses
  };

  const handleOnScanInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, locationScan = false) => {
      send({
        type: 'UPDATE_CURRENT_BARCODE',
        value: e.currentTarget.value,
        locationScan: locationScan
      });
    },
    [send]
  );

  const handleOnScan = useCallback(() => send({ type: 'SUBMIT_BARCODE' }), [send]);

  return (
    <div className="space-y-4">
      {current.matches('idle.success') && successMessage && <Success className="my-2" message={successMessage} />}

      {((current.matches('idle.error') && errorMessage) || (locationScan && errorMessage)) && (
        <Warning className="my-2" message={errorMessage} />
      )}
      <div className="flex flex-row">
        {enableLocationScanner && (
          <div className={'sm:w-2/3 md:w-1/2 mr-4 space-y-2'}>
            <label htmlFor={'locationScanInput'} className={'w-full ml-2 font-sans font-medium text-gray-700'}>
              Location:
            </label>
            <ScanInput
              id="locationScanInput"
              type="text"
              value={locationScan ? currentBarcode : ''}
              disabled={!current.matches('idle')}
              onChange={(e) => handleOnScanInputChange(e, true)}
              onScan={handleOnScan}
            />
          </div>
        )}
        <div className="sm:w-2/3 md:w-1/2 space-y-2">
          {enableLocationScanner && (
            <label htmlFor={'labwareScanInput'} className={'w-full ml-2 font-sans font-medium text-gray-700'}>
              Labware:
            </label>
          )}
          <ScanInput
            id="labwareScanInput"
            type="text"
            value={locationScan ? '' : currentBarcode}
            disabled={!current.matches('idle')}
            onChange={handleOnScanInputChange}
            onScan={handleOnScan}
            ref={inputRef}
          />
        </div>
      </div>

      <LabwareScannerContext.Provider value={ctxValue}>
        {isFunction(children) ? children(ctxValue) : children}
      </LabwareScannerContext.Provider>
    </div>
  );
}

type LabwareScannerContextType = {
  locked: boolean;
  labwares: LabwareFlaggedFieldsFragment[];
  removeLabware: (barcode: string) => void;
  enableFlaggedLabwareCheck?: boolean;
  cleanedOutAddresses?: Map<number, string[]>;
};

const LabwareScannerContext = React.createContext<LabwareScannerContextType>({
  locked: false,
  labwares: [],
  removeLabware: (_barcode) => {},
  enableFlaggedLabwareCheck: false,
  cleanedOutAddresses: new Map<number, string[]>()
});

export function useLabwareContext() {
  return useContext(LabwareScannerContext);
}
