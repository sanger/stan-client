import { LabwareFieldsFragment } from '../../types/sdk';
import LabelPrinterButton from '../../components/LabelPrinterButton';
import { usePrinters } from '../../lib/hooks';
import Heading from '../../components/Heading';
import DataTable from '../../components/DataTable';
import LabelPrinter, { PrintResult } from '../../components/LabelPrinter';
import * as sampleColumns from '../../components/dataTableColumns/sampleColumns';
import { SampleDataTableRow } from '../../components/dataTableColumns/sampleColumns';
import Table, { TableBody, TableHead, TableHeader } from '../../components/Table';
import React from 'react';

export const PrintLabwareWithSampleDetails = ({ labware }: { labware: Array<LabwareFieldsFragment> }) => {
  const labwareGroupedByType = React.useMemo(() => {
    const confirmedLabwareTypes = labware.reduce((prev: string[], lw) => {
      if (!prev.includes(lw.labwareType.name)) {
        prev.push(lw.labwareType.name);
      }
      return prev;
    }, []);

    const labwareGroups: LabwareFieldsFragment[][] = [];
    confirmedLabwareTypes.forEach((labwareType) => {
      labwareGroups.push(labware.filter((labware) => labware.labwareType.name === labwareType));
    });
    return labwareGroups;
  }, [labware]);

  const samples: SampleDataTableRow[] = labware.flatMap((lw) => {
    return lw.slots.flatMap((slot) => {
      return slot.samples.map((sample) => {
        return {
          ...sample,
          barcode: lw.barcode,
          labwareType: lw.labwareType,
          slotAddress: slot.address
        };
      });
    });
  });

  const { handleOnPrint, handleOnPrintError, printResult, currentPrinter, handleOnPrinterChange } = usePrinters();

  return (
    <>
      {labwareGroupedByType.map((labwareByType: LabwareFieldsFragment[]) => (
        <>
          <Heading level={3}>{labwareByType[0].labwareType.name}</Heading>
          <Table>
            <TableHead>
              <TableHeader>Barcode</TableHeader>
              <TableHeader className="grid grid-cols-3 gap-2">
                <span>External ID</span>
                <span>Tissue Type</span>
                <span>Section Number</span>
              </TableHeader>
              <TableHeader>Print</TableHeader>
            </TableHead>
            <TableBody>
              {labware.map((lw) => (
                <tr key={lw.barcode}>
                  <td>{lw.barcode}</td>
                  <td>
                    <DataTable
                      noHeader={true}
                      columns={[sampleColumns.externalId(), sampleColumns.tissueType(), sampleColumns.sectionNumber()]}
                      data={samples.filter((s) => s.barcode === lw.barcode)}
                    />
                  </td>
                  <td>
                    <LabelPrinterButton
                      labwares={[lw]}
                      selectedPrinter={currentPrinter}
                      onPrint={handleOnPrint}
                      onPrintError={handleOnPrintError}
                    />
                  </td>
                </tr>
              ))}
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
      ))}
    </>
  );
};
