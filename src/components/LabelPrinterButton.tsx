import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import PrintIcon from "./icons/PrintIcon";
import { GetPrintersQuery, LabelType, Labware, Maybe } from "../types/graphql";
import { buildLabelPrinterMachine } from "../lib/factories/machineFactory";
import { PrintableLabware } from "../types/stan";

interface LabelPrinterButtonProps {
  selectedPrinter?: Maybe<GetPrintersQuery["printers"][number]>;
  labelsPerBarcode?: number;
  labwares: Array<
    Pick<Labware, "barcode"> & {
      labwareType: {
        labelType?: Maybe<Pick<LabelType, "name">>;
      };
    }
  >;
  onPrint?: (
    printer: GetPrintersQuery["printers"][number],
    labwares: Array<PrintableLabware>,
    labelsPerBarcode: number
  ) => void;
  onPrintError?: (
    printer: GetPrintersQuery["printers"][number],
    labwares: Array<PrintableLabware>,
    labelsPerBarcode: number
  ) => void;
}

const LabelPrinterButton: React.FC<LabelPrinterButtonProps> = ({
  selectedPrinter,
  labelsPerBarcode = 1,
  labwares,
  onPrint,
  onPrintError,
}) => {
  const [current, send, service] = useMachine(
    buildLabelPrinterMachine(labwares, labelsPerBarcode, selectedPrinter)
  );

  useEffect(() => {
    service.onTransition((state) => {
      if (
        state.context.selectedPrinter &&
        state.matches({ ready: "printSuccess" })
      ) {
        onPrint?.(
          state.context.selectedPrinter,
          state.context.labwares,
          state.context.labelsPerBarcode
        );
      }

      if (
        state.context.selectedPrinter &&
        state.matches({ ready: "printError" })
      ) {
        onPrintError?.(
          state.context.selectedPrinter,
          state.context.labwares,
          state.context.labelsPerBarcode
        );
      }
    });
  }, [service, onPrint, onPrintError]);

  return (
    <button
      disabled={current.matches("fetching") || current.matches("printing")}
      onClick={() => send({ type: "PRINT" })}
      type="button"
      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 active:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      <PrintIcon className="h-5 w-5 text-gray-800" />
    </button>
  );
};

export default LabelPrinterButton;
