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
  initialLabwares?: LabwareFieldsFragment[];

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
   * Children can either be a react node (if using the useLabware hook)
   * Or it can be a function that will have the context passed in
   */
  children:
    | React.ReactNode
    | ((props: LabwareScannerContextType) => React.ReactNode);
};

export default function LabwareScanner({
  initialLabwares = [],
  locked = false,
  labwareCheckFunction,
  onChange,
  children,
}: LabwareScannerProps) {
  const [current, send] = useMachine(
    createLabwareMachine(initialLabwares, labwareCheckFunction)
  );
  const {
    labwares,
    successMessage,
    errorMessage,
    currentBarcode,
  } = current.context;

  useEffect(() => {
    send(locked ? { type: "LOCK" } : { type: "UNLOCK" });
  }, [send, locked]);

  // Call onChange handler whenever labwares change
  const previousLabwareLength = usePrevious(labwares.length);
  useEffect(() => {
    if (labwares.length !== previousLabwareLength) {
      onChange?.(labwares);
    }
  }, [labwares, onChange, previousLabwareLength]);

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

  return (
    <div className="space-y-4">
      {current.matches("idle.success") && successMessage && (
        <Success className="my-2" message={successMessage} />
      )}
      {current.matches("idle.error") && errorMessage && (
        <Warning className="my-2" message={errorMessage} />
      )}

      <div className="sm:w-2/3 md:w-1/2">
        <ScanInput
          id="labwareScanInput"
          type="text"
          value={currentBarcode}
          disabled={current.matches("locked")}
          onChange={handleOnScanInputChange}
          onScan={handleOnScan}
        />
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
