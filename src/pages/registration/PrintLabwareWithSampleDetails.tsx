import { LabwareFieldsFragment } from '../../types/sdk';
import LabelPrinterButton from '../../components/LabelPrinterButton';
import { usePrinters } from '../../lib/hooks';
import Heading from '../../components/Heading';
import LabelPrinter, { PrintResult } from '../../components/LabelPrinter';
import { SampleDataTableRow } from '../../components/dataTableColumns/sampleColumns';
import Table, { TableBody, TableHead, TableHeader } from '../../components/Table';
import React from 'react';

export const PrintLabwareWithSampleDetails = ({ labware }: { labware: Array<LabwareFieldsFragment> }) => {
  const samplesDataRow = React.useCallback((labware: LabwareFieldsFragment): SampleDataTableRow[] => {
    return labware.slots.flatMap((slot) => {
      return slot.samples.map((sample) => {
        return {
          ...sample,
          barcode: labware.barcode,
          labwareType: labware.labwareType,
          slotAddress: slot.address
        };
      });
    });
  }, []);

  const { handleOnPrint, handleOnPrintError, printResult, currentPrinter, handleOnPrinterChange } = usePrinters();

  return (
    <>
      <Heading level={3}>{labware[0].labwareType.name}</Heading>
      <Table>
        <TableHead>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>External ID</TableHeader>
          <TableHeader>Tissue Type</TableHeader>
          <TableHeader>Section Number</TableHeader>
          <TableHeader>Print</TableHeader>
        </TableHead>
        <TableBody>
          {labware.map((lw) =>
            samplesDataRow(lw).map((data, index) => (
              <tr key={index}>
                <td>{data.barcode}</td>
                <td>{data.tissue.externalName}</td>
                <td>{data.tissue.spatialLocation.tissueType.name}</td>
                <td>{data.section}</td>
                <td>
                  <LabelPrinterButton
                    labwares={[lw]}
                    selectedPrinter={currentPrinter}
                    onPrint={() => handleOnPrint(currentPrinter!, [lw], 1)}
                    onPrintError={() => handleOnPrintError(currentPrinter!, [lw], 1)}
                  />
                </td>
              </tr>
            ))
          )}
        </TableBody>
      </Table>

      <LabelPrinter
        labwares={labware}
        showNotifications={false}
        onPrinterChange={handleOnPrinterChange}
        onPrint={handleOnPrint}
        onPrintError={handleOnPrintError}
      />

      {printResult && <PrintResult result={printResult} />}
    </>
  );
};
