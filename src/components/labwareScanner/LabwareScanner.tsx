import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { useMachine } from '@xstate/react';
import { createLabwareMachine } from '../../lib/machines/labware/labwareMachine';
import ScanInput from '../scanInput/ScanInput';
import Success from '../notifications/Success';
import Warning from '../notifications/Warning';
import { isFunction } from 'lodash';
import { usePrevious } from '../../lib/hooks';

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
  onChange?: (labwares: LabwareFlaggedFieldsFragment[]) => void;

  /**
   * Callback for when a labware is added
   * @param labware the added labware
   */
  onAdd?: (labware: LabwareFlaggedFieldsFragment) => void;

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
  children: React.ReactNode | ((props: LabwareScannerContextType) => React.ReactNode);

  enableLocationScanner?: boolean;

  /**
   * defaults to false, when set to true labwareMachine runs the FindFlaggedLabware query instead of the FindLabware query.
   */
  enableFlaggedLabwareCheck?: boolean;
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
  enableFlaggedLabwareCheck = false
}: LabwareScannerProps) {
  const slicedInitialLabware = React.useMemo(() => {
    if (!initialLabwares) return [];
    if (limit && initialLabwares.length > limit) {
      return initialLabwares.slice(0, limit);
    } else return initialLabwares;
  }, [initialLabwares, limit]);

  const labwareMachine = React.useMemo(() => {
    return createLabwareMachine();
  }, []);

  const [current, send, service] = useMachine(labwareMachine, {
    context: {
      labwares: slicedInitialLabware,
      foundLabwareCheck: labwareCheckFunction,
      limit,
      enableFlaggedLabwareCheck
    }
  });

  const { labwares, removedLabware, successMessage, errorMessage, currentBarcode, locationScan } = current.context;

  /**
   * After transition into the "idle" state, focus the scan input
   */
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const subscription = service.subscribe((observer) => {
      if (observer.matches('idle') && !observer.context.locationScan) {
        inputRef.current?.focus();
      }
    });
    return subscription.unsubscribe;
  }, [service]);

  useEffect(() => {
    send(locked ? { type: 'LOCK' } : { type: 'UNLOCK' });
  }, [send, locked]);

  // Call relevant handlers whenever labwares change
  const previousLabwareLength = usePrevious(labwares.length);
  useEffect(() => {
    if (typeof previousLabwareLength === 'undefined') return;
    if (labwares.length !== previousLabwareLength) {
      onChange?.(labwares);
    }

    if (labwares.length > previousLabwareLength) {
      onAdd?.(labwares[labwares.length - 1]);
    }

    if (labwares.length < previousLabwareLength) {
      removedLabware && onRemove?.(removedLabware.labware, removedLabware.index);
    }
  }, [labwares, onChange, onAdd, removedLabware, onRemove, previousLabwareLength]);

  const ctxValue: LabwareScannerContextType = {
    locked: current.matches('locked'),
    labwares: labwares,
    removeLabware: React.useCallback(
      (barcode) => {
        send({ type: 'REMOVE_LABWARE', value: barcode });
      },
      [send]
    ),
    enableFlaggedLabwareCheck: enableFlaggedLabwareCheck
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
};

const LabwareScannerContext = React.createContext<LabwareScannerContextType>({
  locked: false,
  labwares: [],
  removeLabware: (_barcode) => {},
  enableFlaggedLabwareCheck: false
});

export function useLabwareContext() {
  return useContext(LabwareScannerContext);
}
