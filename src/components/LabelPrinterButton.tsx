import React from "react";
import { Actor } from "xstate";
import { useActor } from "@xstate/react";
import {
  LabelPrinterEvents,
  LabelPrinterMachineType,
} from "../lib/machines/labelPrinter";
import PrintIcon from "./icons/PrintIcon";
import { print } from "../lib/machines/labelPrinter/labelPrinterEvents";

interface LabelPrinterButtonProps {
  actor: Actor<any, any>;
}

const LabelPrinterButton: React.FC<LabelPrinterButtonProps> = ({ actor }) => {
  const printMachine = useActor<
    LabelPrinterEvents,
    LabelPrinterMachineType["state"]
  >(actor);

  return (
    <button
      onClick={() => printMachine[1](print())}
      type="button"
      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 active:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      <PrintIcon className="h-5 w-5 text-gray-800" />
    </button>
  );
};

export default LabelPrinterButton;
