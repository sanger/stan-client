import React from 'react';
import Heading from '../Heading';
import { motion } from '../../dependencies/motion';
import variants from '../../lib/motionVariants';
import DataTable from '../DataTable';
import LabelPrinter, { PrintResult } from '../LabelPrinter';
import { LabwareFieldsFragment } from '../../types/sdk';
import { usePrinters } from '../../lib/hooks';
import { CellProps } from 'react-table';
import LabelPrinterButton from '../LabelPrinterButton';
import labwareScanTableColumns from '../dataTableColumns/labwareColumns';

type ConfirmPrintLabwareProps = {
  labwareType: string;
  labwares: LabwareFieldsFragment[];
};
export const ConfirmPrintLabware = ({ labwareType, labwares }: ConfirmPrintLabwareProps) => {
  const { handleOnPrint, handleOnPrintError, printResult, currentPrinter, handleOnPrinterChange } = usePrinters();

  // Special case column that renders a label printer button for each row
  const printColumn = {
    id: 'printer',
    Header: '',
    Cell: (props: CellProps<LabwareFieldsFragment>) => (
      <LabelPrinterButton
        labwares={[props.row.original]}
        selectedPrinter={currentPrinter}
        onPrint={handleOnPrint}
        onPrintError={handleOnPrintError}
      />
    )
  };
  const columns = [labwareScanTableColumns.barcode(), printColumn];

  return (
    <>
      <Heading level={3}>{`${labwareType}`}</Heading>
      <motion.div
        variants={variants.fadeInWithLift}
        initial={'hidden'}
        animate={'visible'}
        className="relative p-3 shadow-md space-y-4 px-4"
      >
        <DataTable columns={columns} data={labwares} />

        <LabelPrinter
          labwares={labwares}
          showNotifications={false}
          onPrinterChange={handleOnPrinterChange}
          onPrint={handleOnPrint}
          onPrintError={handleOnPrintError}
        />
        {printResult && <PrintResult result={printResult} />}
      </motion.div>
    </>
  );
};
