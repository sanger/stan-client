import React, { useEffect } from 'react';
import { optionValues } from './forms';
import { useMachine } from '@xstate/react';
import LoadingSpinner from './icons/LoadingSpinner';
import Success from './notifications/Success';
import Warning from './notifications/Warning';
import BlueButton from './buttons/BlueButton';
import { LabwareFieldsFragment, PrinterFieldsFragment } from '../types/sdk';
import { PrintResultType } from '../types/stan';
import createLabelPrinterMachine from '../lib/machines/labelPrinter/labelPrinterMachine';

interface LabelPrinterProps {
  labwares: Array<LabwareFieldsFragment>;
  labelsPerBarcode?: number;
  onPrint?: (printer: PrinterFieldsFragment, labwares: Array<LabwareFieldsFragment>, labelsPerBarcode: number) => void;
  onPrintError?: (
    printer: PrinterFieldsFragment,
    labwares: Array<LabwareFieldsFragment>,
    labelsPerBarcode: number
  ) => void;
  onPrinterChange?: (printer: PrinterFieldsFragment) => void;
  showNotifications?: boolean;
}

const LabelPrinter: React.FC<LabelPrinterProps> = ({
  labwares,
  labelsPerBarcode = 1,
  onPrint,
  onPrintError,
  onPrinterChange,
  showNotifications = true
}) => {
  const [current, send, service] = useMachine(
    createLabelPrinterMachine({
      context: {
        selectedPrinter: null,
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

  useEffect(() => {
    onPrinterChange?.(current.context.selectedPrinter!);
  }, [current.context.selectedPrinter, onPrinterChange]);

  if (current.matches('fetching')) {
    return <LoadingSpinner />;
  }

  const { context } = current;

  const updateSelectedLabelPrinter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    send({
      type: 'UPDATE_SELECTED_LABEL_PRINTER',
      name: e.currentTarget.value
    });
  };

  const printLabels = () => send({ type: 'PRINT', labelsPerBarcode });

  return (
    <div className="space-y-4">
      {showNotifications && (current.matches({ ready: 'printSuccess' }) || current.matches({ ready: 'printError' })) && (
        <PrintResult
          result={{
            successful: current.matches({ ready: 'printSuccess' }),
            labelsPerBarcode,
            printer: context.selectedPrinter!,
            labwares: context.labwares
          }}
        />
      )}
      <div className="sm:flex sm:flex-row space-y-2 items-center justify-end sm:space-x-2 sm:space-y-0">
        <select
          aria-label="printers"
          disabled={current.matches('printing')}
          value={context.selectedPrinter?.name}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 sm:w-1/2"
          onChange={updateSelectedLabelPrinter}
        >
          {context.printers?.length > 0 && optionValues(context.printers, 'name', 'name')}
        </select>

        <div>
          <BlueButton
            disabled={current.matches('printing') || context.printers?.length === 0}
            onClick={printLabels}
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
    </div>
  );
};

export default LabelPrinter;

export function PrintResult(props: { result: PrintResultType }) {
  if (props.result.successful) {
    return (
      <Success
        message={`${props.result.printer.name} successfully printed${
          props.result.labelsPerBarcode > 1 ? ' ' + props.result.labelsPerBarcode + ' labels for' : ''
        } ${props.result.labwares.map((lw) => lw.barcode).join(', ')}`}
      />
    );
  } else {
    return (
      <Warning
        message={`${props.result.printer.name} failed to print ${props.result.labwares
          .map((lw) => lw.barcode)
          .join(', ')}`}
      />
    );
  }
}
