import React, { useCallback, useMemo } from 'react';
import AppShell from '../components/AppShell';
import BlueButton from '../components/buttons/BlueButton';
import Heading from '../components/Heading';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTableColumns/labwareColumns';
import Warning from '../components/notifications/Warning';
import { motion } from 'framer-motion';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import LabelPrinterButton from '../components/LabelPrinterButton';
import Circle from '../components/Circle';
import LabelPrinter, { PrintResult } from '../components/LabelPrinter';
import Success from '../components/notifications/Success';
import variants from '../lib/motionVariants';
import { usePrinters } from '../lib/hooks';
import MutedText from '../components/MutedText';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { useMachine } from '@xstate/react';
import { buildSampleColors } from '../lib/helpers/labwareHelper';
import { LabwareFieldsFragment } from '../types/sdk';
import extractionMachine, { ExtractionContext } from '../lib/machines/extraction/extractionMachine';
import { Link } from 'react-router-dom';
import ButtonBar from '../components/ButtonBar';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabelCopyButton from '../components/LabelCopyButton';

function buildExtractionTableData(ctx: ExtractionContext) {
  if (!ctx.extraction) return [];
  const sourceLabwares = ctx.labwares;
  const destinationLabwares = ctx.extraction.extract.labware;
  const sampleColors = buildSampleColors(destinationLabwares);

  debugger;
  /**
   * The result will contain one operation per labware, and each operation will contain one action per sample in the labware.
   * Here it is refined to show  one result per operation.
   */

  return ctx.extraction.extract.operations
    .map((operation) => {
      return {
        sampleColor: sampleColors.get(operation.actions[0].sample.id),
        sourceLabware: sourceLabwares.find((lw) => lw.id === operation.actions[0].source.labwareId),
        destinationLabware: destinationLabwares.find((lw) => lw.id === operation.actions[0].destination.labwareId)
      };
    })
    .flat();
}

function Extraction() {
  const [current, send] = useMachine(() => extractionMachine.withContext({ labwares: [], workNumber: '' }));

  const { handleOnPrint, handleOnPrintError, handleOnPrinterChange, printResult, currentPrinter } = usePrinters();

  const { labwares, serverErrors, extraction } = current.context;

  const sampleColors: Map<number, string> = useMemo(() => {
    return buildSampleColors(labwares);
  }, [labwares]);

  const columns = useMemo(
    () => [
      labwareScanTableColumns.color(sampleColors),
      labwareScanTableColumns.barcode(),
      labwareScanTableColumns.donorId(),
      labwareScanTableColumns.tissueType(),
      labwareScanTableColumns.spatialLocation(),
      labwareScanTableColumns.replicate()
    ],
    [sampleColors]
  );

  const extractionTableData = useMemo(() => {
    return buildExtractionTableData(current.context);
  }, [current]);

  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
  );

  const onLabwareScannerChange = (labwares: Array<LabwareFieldsFragment>) =>
    send({ type: 'UPDATE_LABWARES', labwares });

  const scannerLocked = !current.matches('ready') && !current.matches('extractionFailed');

  const showGrayPanel = current.matches('ready') || current.matches('extractionFailed');

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Extraction</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Select an SGP number to associate with this extraction.</p>
            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Heading level={3}>Section Tubes</Heading>

            <LabwareScanner onChange={onLabwareScannerChange} locked={scannerLocked}>
              <LabwareScanPanel columns={columns} />
            </LabwareScanner>
          </div>

          {current.matches('extracted') && (
            <motion.div initial={'hidden'} animate={'visible'} variants={variants.fadeIn} className="mt-12 space-y-4">
              <Heading level={3}>RNA Tubes</Heading>

              <Success message={'Extraction Complete'}>Your source tubes have been marked as discarded.</Success>

              <Table>
                <TableHead>
                  <tr>
                    <TableHeader />
                    <TableHeader>Source Labware</TableHeader>
                    <TableHeader>Destination Labware</TableHeader>
                    <TableHeader />
                    <TableHeader />
                  </tr>
                </TableHead>
                <TableBody>
                  {extractionTableData.map((data) => (
                    <tr key={data.destinationLabware?.barcode}>
                      <TableCell>{data.sampleColor && <Circle backgroundColor={data.sampleColor} />}</TableCell>
                      <TableCell>{data.sourceLabware?.barcode}</TableCell>
                      <TableCell>{data.destinationLabware?.barcode}</TableCell>
                      <TableCell>
                        {data.destinationLabware && (
                          <LabelPrinterButton
                            labelsPerBarcode={2}
                            labwares={[data.destinationLabware]}
                            selectedPrinter={currentPrinter}
                            onPrint={handleOnPrint}
                            onPrintError={handleOnPrintError}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {data.destinationLabware && <LabelCopyButton labware={[data.destinationLabware]} />}
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end sm:justify-end space-y-2">
                <div className="sm:max-w-xl w-full p-4 rounded-md border-gray-200 bg-gray-100 shadow space-y-2">
                  {printResult && <PrintResult result={printResult} />}
                  <LabelPrinter
                    labelsPerBarcode={2}
                    showNotifications={false}
                    labwares={extraction?.extract?.labware ?? []}
                    onPrint={handleOnPrint}
                    onPrintError={handleOnPrintError}
                    onPrinterChange={handleOnPrinterChange}
                  />
                  <MutedText className="text-right">
                    Note: 2 labels for each destination labware will be printed.
                  </MutedText>
                </div>
                <div
                  className={
                    'flex flex-col sm:max-w-xl w-full p-4 rounded-md border-gray-200 bg-gray-100 shadow items-end sm:justify-end space-y-2'
                  }
                >
                  <div className={'flex items-center space-x-2'}>
                    <div className={'font-bold'}>Labels:</div>
                    <div>{extraction?.extract?.labware.map((lw) => lw.barcode).join(',')}</div>
                  </div>
                  <LabelCopyButton
                    labware={extraction?.extract?.labware ?? []}
                    copyButtonText={'Copy Labels'}
                    buttonClass={
                      'text-white bg-sdb-400 shadow-sm hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600'
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AppShell.Main>

      {showGrayPanel && (
        <div className="flex-shrink-0 max-w-screen-xl mx-auto">
          {serverErrors && <Warning error={serverErrors} />}

          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all tubes</span> have been scanned, click Extract to create
              destination labware.
            </p>

            <p className="my-3 text-gray-800 text-xs leading-relaxed italic text-center">
              Source labware will be marked as discarded.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="#extract"
                disabled={!current.matches({ ready: 'valid' })}
                className="whitespace-nowrap"
                action={'primary'}
                onClick={() => send({ type: 'EXTRACT' })}
              >
                Extract
              </BlueButton>
            </div>
          </div>
        </div>
      )}

      {current.matches('extracted') && (
        <ButtonBar>
          <BlueButton onClick={reload} action="tertiary">
            Reset Form
          </BlueButton>
          <Link to={'/'}>
            <BlueButton action="primary">Return Home</BlueButton>
          </Link>
          <div className={''}>
            <Link
              to={{
                pathname: '/lab/extraction_result',
                state: { labware: extraction?.extract?.labware }
              }}
            >
              <BlueButton action="primary">Go to Extraction Result &gt;</BlueButton>
            </Link>
          </div>
        </ButtonBar>
      )}
    </AppShell>
  );
}

export default Extraction;
