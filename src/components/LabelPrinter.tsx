import React from "react";
import { optionValues } from "./forms";
import { useActor } from "@xstate/react";
import LoadingSpinner from "./icons/LoadingSpinner";
import {
  LabelPrinterActorRef,
  LabelPrinterEvents,
  LabelPrinterMachineType,
} from "../lib/machines/labelPrinter";
import {
  print,
  updateSelectedLabelPrinter,
} from "../lib/machines/labelPrinter/labelPrinterEvents";
import Success from "./notifications/Success";
import Warning from "./notifications/Warning";
import BlueButton from "./buttons/BlueButton";

interface LabelPrinterProps {
  actor: LabelPrinterActorRef;
}

const LabelPrinter: React.FC<LabelPrinterProps> = ({ actor }) => {
  const [state, send] = useActor<
    LabelPrinterEvents,
    LabelPrinterMachineType["state"]
  >(actor);

  const {
    labelPrinter: { printers, selectedPrinter },
    successMessage,
    errorMessage,
    options: { showNotifications },
  } = state.context;

  if (state.matches("initialising")) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="sm:flex sm:flex-row space-y-2 items-center justify-end sm:space-x-2 sm:space-y-0">
        <select
          aria-label="printers"
          disabled={state.matches("printing")}
          value={selectedPrinter?.name}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 sm:w-1/2"
          onChange={(e) =>
            send(updateSelectedLabelPrinter(e.currentTarget.value))
          }
        >
          {optionValues(printers, "name", "name")}
        </select>

        <div>
          <BlueButton
            disabled={state.matches("printing") || printers.length === 0}
            onClick={() => send(print())}
            className="flex flex-row items-center justify-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="inline-block h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="inline-block">Print Labels</span>
          </BlueButton>
        </div>
      </div>
      {showNotifications && successMessage && (
        <Success message={successMessage} />
      )}
      {showNotifications && errorMessage && <Warning message={errorMessage} />}
    </div>
  );
};

export default LabelPrinter;
