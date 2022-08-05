import React, { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import PrintIcon from './icons/PrintIcon';
import { LabwareFieldsFragment, Maybe, PrinterFieldsFragment } from '../types/sdk';
import createLabelPrinterMachine from '../lib/machines/labelPrinter/labelPrinterMachine';

interface LabelPrinterButtonProps {
  selectedPrinter?: Maybe<PrinterFieldsFragment>;
  labelsPerBarcode?: number;
  labwares: Array<LabwareFieldsFragment>;
  onPrint?: (printer: PrinterFieldsFragment, labwares: Array<LabwareFieldsFragment>, labelsPerBarcode: number) => void;
  onPrintError?: (
    printer: PrinterFieldsFragment,
    labwares: Array<LabwareFieldsFragment>,
    labelsPerBarcode: number
  ) => void;
}

const LabelPrinterButton: React.FC<LabelPrinterButtonProps> = ({
  selectedPrinter,
  labelsPerBarcode = 1,
  labwares,
  onPrint,
  onPrintError
}) => {
  const [current, send, service] = useMachine(
    createLabelPrinterMachine({
      context: {
        selectedPrinter,
        labwares
      }
    })
  );

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.context.selectedPrinter && state.matches({ ready: 'printSuccess' })) {
        onPrint?.(state.context.selectedPrinter, state.context.labwares, labelsPerBarcode);
      }

      if (state.context.selectedPrinter && state.matches({ ready: 'printError' })) {
        onPrintError?.(state.context.selectedPrinter, state.context.labwares, labelsPerBarcode);
      }
    });

    return () => subscription.unsubscribe();
  }, [service, onPrint, onPrintError, labelsPerBarcode]);

  return (
    <button
      id={'printButton'}
      disabled={current.matches('fetching') || current.matches('printing')}
      onClick={() => send({ type: 'PRINT', labelsPerBarcode })}
      type="button"
      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 active:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      <PrintIcon className="h-5 w-5 text-gray-800" />
    </button>
  );
};

export default LabelPrinterButton;
