import React from "react";
import AppShell from "../components/AppShell";
import ExtractionPresentationModel from "../lib/presentationModels/extractionPresentationModel";

import BlueButton from "../components/buttons/BlueButton";
import Heading from "../components/Heading";
import LabwareScanPanel from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/labwareScanPanel/columns";
import Warning from "../components/notifications/Warning";
import { motion } from "framer-motion";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/Table";
import LabelPrinterButton from "../components/LabelPrinterButton";
import Circle from "../components/Circle";
import LabelPrinter, { PrintResult } from "../components/LabelPrinter";
import Success from "../components/notifications/Success";
import variants from "../lib/motionVariants";
import { usePrinters } from "../lib/hooks";

interface PageParams {
  model: ExtractionPresentationModel;
}

const Extraction: React.FC<PageParams> = ({ model }) => {
  const {
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    printResult,
    currentPrinter,
  } = usePrinters();

  const columns = [
    labwareScanTableColumns.color(model.sampleColors),
    labwareScanTableColumns.barcode(),
    labwareScanTableColumns.donorId(),
    labwareScanTableColumns.tissueType(),
    labwareScanTableColumns.spatialLocation(),
    labwareScanTableColumns.replicate(),
  ];

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Extraction</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-4">
            <Heading level={3}>Section Tubes</Heading>

            <LabwareScanPanel
              onChange={model.updateLabwares}
              columns={columns}
              locked={model.isLabwareScanPanelLocked}
            />
          </div>

          {model.showExtractionTubes && (
            <motion.div
              initial={"hidden"}
              animate={"visible"}
              variants={variants.fadeIn}
              className="mt-12 space-y-4"
            >
              <Heading level={3}>RNA Tubes</Heading>

              <Success message={"Extraction Complete"}>
                Your source tubes have been marked as discarded.
              </Success>

              <Table>
                <TableHead>
                  <tr>
                    <TableHeader />
                    <TableHeader>Source Labware</TableHeader>
                    <TableHeader>Destination Labware</TableHeader>
                    <TableHeader />
                  </tr>
                </TableHead>
                <TableBody>
                  {model.extractionTableData.map((data) => (
                    <tr key={data.destinationLabware?.barcode}>
                      <TableCell>
                        {data.sampleColor && (
                          <Circle backgroundColor={data.sampleColor} />
                        )}
                      </TableCell>
                      <TableCell>{data.sourceLabware?.barcode}</TableCell>
                      <TableCell>{data.destinationLabware?.barcode}</TableCell>
                      <TableCell>
                        {data.destinationLabware && (
                          <LabelPrinterButton
                            labwares={[data.destinationLabware]}
                            selectedPrinter={currentPrinter}
                            onPrint={handleOnPrint}
                            onPrintError={handleOnPrintError}
                          />
                        )}
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-row items-center sm:justify-end">
                <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2">
                  {printResult && <PrintResult result={printResult} />}
                  <LabelPrinter
                    showNotifications={false}
                    labwares={model.destinationLabwares}
                    onPrint={handleOnPrint}
                    onPrintError={handleOnPrintError}
                    onPrinterChange={handleOnPrinterChange}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AppShell.Main>

      {model.showGrayPanel && (
        <div className="flex-shrink-0 max-w-screen-xl mx-auto">
          {model.showServerErrors && (
            <Warning error={model.context.serverErrors} />
          )}

          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all tubes</span>{" "}
              have been scanned, click Extract to create destination labware.
            </p>

            <p className="my-3 text-gray-800 text-xs leading-relaxed italic text-center">
              Source labware will be marked as discarded.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="#extract"
                disabled={!model.isExtractBtnEnabled}
                className="whitespace-nowrap"
                action={"primary"}
                onClick={model.extract}
              >
                Extract
              </BlueButton>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Extraction;
