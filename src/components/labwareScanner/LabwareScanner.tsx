import React, { useCallback, useContext, useEffect } from "react";
import { LabwareFieldsFragment } from "../../types/sdk";
import { useMachine } from "@xstate/react";
import { createLabwareMachine } from "../../lib/machines/labware/labwareMachine";
import ScanInput from "../scanInput/ScanInput";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import { isFunction } from "lodash";
import { usePrevious } from "../../lib/hooks";

type LabwareScannerProps = {
  /**
   * The initial list of labwares the scanner should be displaying
   */
  initialLabwares?: LabwareFieldsFragment[];

  /**
   * True is the scanner should be locked; false otherwise
   */
  locked?: boolean;

  /**
   * A function to check for problems with new labware because it is added
   */
  labwareCheckFunction?: (
    labwares: LabwareFieldsFragment[],
    foundLabware: LabwareFieldsFragment
  ) => string[];

  /**
   * Called when labware is added or removed
   * @param labwares the list of current labwares
   */
  onChange?: (labwares: LabwareFieldsFragment[]) => void;

  /**
   * Callback for when a labware is added
   * @param labware the added labware
   */
  onAdd?: (labware: LabwareFieldsFragment) => void;

  /**
   * Callback for when a labware is removed
   * @param labware the removed labware
   * @param index the index of the removed labware
   */
  onRemove?: (labware: LabwareFieldsFragment, index: number) => void;

  /**
   * Children can either be a react node (if using the useLabware hook)
   * Or it can be a function that will have the context passed in
   */
  children:
    | React.ReactNode
    | ((props: LabwareScannerContextType) => React.ReactNode);

  enableLocationScanner?: boolean;
};

export default function LabwareScanner({
  initialLabwares = [],
  locked = false,
  labwareCheckFunction,
  onChange,
  onAdd,
  onRemove,
  children,
  enableLocationScanner,
}: LabwareScannerProps) {
  const [current, send] = useMachine(
    createLabwareMachine(initialLabwares, labwareCheckFunction)
  );

  const {
    labwares,
    removedLabware,
    successMessage,
    errorMessage,
    currentBarcode,
  } = current.context;

  useEffect(() => {
    send(locked ? { type: "LOCK" } : { type: "UNLOCK" });
  }, [send, locked]);

  // Call relevant handlers whenever labwares change
  const previousLabwareLength = usePrevious(labwares.length);
  useEffect(() => {
    if (typeof previousLabwareLength === "undefined") return;

    if (labwares.length !== previousLabwareLength) {
      onChange?.(labwares);
    }

    if (labwares.length > previousLabwareLength) {
      onAdd?.(labwares[labwares.length - 1]);
    }

    if (labwares.length < previousLabwareLength) {
      removedLabware &&
        onRemove?.(removedLabware.labware, removedLabware.index);
    }
  }, [
    labwares,
    onChange,
    onAdd,
    removedLabware,
    onRemove,
    previousLabwareLength,
  ]);

  const ctxValue: LabwareScannerContextType = {
    locked: current.matches("locked"),
    labwares: labwares,
    removeLabware: React.useCallback(
      (barcode) => send({ type: "REMOVE_LABWARE", value: barcode }),
      [send]
    ),
  };

  const handleOnScanInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      send({
        type: "UPDATE_CURRENT_BARCODE",
        value: e.currentTarget.value,
      });
    },
    [send]
  );

  const handleOnScan = useCallback(() => send({ type: "SUBMIT_BARCODE" }), [
    send,
  ]);

  const handleOnScan = useCallback(() => send({ type: "SUBMIT_BARCODE" }), [
    send,
  ]);

  return (
    <div className="space-y-4">
      {current.matches("idle.success") && successMessage && (
        <Success className="my-2" message={successMessage} />
      )}
      {current.matches("idle.error") && errorMessage && (
        <Warning className="my-2" message={errorMessage} />
      )}
      <div className="flex flex-row">
        {enableLocationScanner && (
          <div className={"sm:w-2/3 md:w-1/2 mr-4 space-y-2"}>
            <label
              htmlFor={"locationScanInput"}
              className={"w-full ml-2 font-sans font-medium text-gray-700"}
            >
              Location:
            </label>
            <ScanInput
              id="locationScanInput"
              type="text"
              disabled={current.matches("locked")}
              onChange={handleOnScanInputChange}
              onScan={handleOnScan}
            />
          </div>
        )}
        <div className="sm:w-2/3 md:w-1/2 space-y-2">
          {enableLocationScanner && (
            <label
              htmlFor={"locationScanInput"}
              className={"w-full ml-2 font-sans font-medium text-gray-700"}
            >
              Labware:
            </label>
          )}
          <ScanInput
            id="labwareScanInput"
            type="text"
            value={currentBarcode}
            disabled={current.matches("locked")}
            onChange={handleOnScanInputChange}
            onScan={handleOnScan}
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
  labwares: LabwareFieldsFragment[];
  removeLabware: (barcode: string) => void;
};

const LabwareScannerContext = React.createContext<LabwareScannerContextType>({
  locked: false,
  labwares: [],
  removeLabware: (_barcode) => {},
});

export function useLabwareContext() {
  return useContext(LabwareScannerContext);
}
