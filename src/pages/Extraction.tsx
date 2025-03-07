import React, { useCallback, useMemo } from 'react';
import AppShell from '../components/AppShell';
import BlueButton from '../components/buttons/BlueButton';
import Heading from '../components/Heading';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTableColumns/labwareColumns';
import Warning from '../components/notifications/Warning';
import { motion } from '../dependencies/motion';
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
import { buildSampleColors, extractLabwareFromFlagged, hasSamples } from '../lib/helpers/labwareHelper';
import { EquipmentFieldsFragment, LabwareFlaggedFieldsFragment } from '../types/sdk';
import extractionMachine, { ExtractionContext } from '../lib/machines/extraction/extractionMachine';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import ButtonBar from '../components/ButtonBar';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabelCopyButton from '../components/LabelCopyButton';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';

function buildExtractionTableData(ctx: ExtractionContext) {
  if (!ctx.extraction) return [];
  const sourceLabwares = ctx.labwares;
  const destinationLabwares = ctx.extraction.extract.labware;
  const sampleColors = buildSampleColors(destinationLabwares);
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
const extractionEquipments = (equipments: EquipmentFieldsFragment[]) => {
  const methods: Array<{ value: number; label: string }> = [];

  equipments.forEach((equipment) => {
    methods.push({ value: equipment.id, label: `Automated - ${equipment.name}` });
  });
  methods.push({ value: -1, label: 'Manual' });
  return methods;
};

function Extraction() {
  const equipments = useLoaderData() as EquipmentFieldsFragment[];
  const [current, send] = useMachine(extractionMachine);

  const { handleOnPrint, handleOnPrintError, handleOnPrinterChange, printResult, currentPrinter } = usePrinters();

  const { labwares, serverErrors, extraction } = current.context;

  const extractionMethodOptions = useMemo(() => extractionEquipments(equipments), [equipments]);

  const sampleColors: Map<number, string> = useMemo(() => {
    return buildSampleColors(labwares);
  }, [labwares]);

  const navigate = useNavigate();

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

  const onLabwareScannerChange = (labwares: Array<LabwareFlaggedFieldsFragment>) =>
    send({ type: 'UPDATE_LABWARES', labwares: extractLabwareFromFlagged(labwares) });

  const scannerLocked = !current.matches('ready') && !current.matches('extractionFailed');

  const showGrayPanel = current.matches('ready') || current.matches('extractionFailed');

  const validateLabware = useCallback(
    (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): string[] => {
      return hasSamples(foundLabware) ? [] : ['No samples found in the labware'];
    },
    []
  );

  const handleExtractMethodChange = useCallback(
    (equipmentId: number) => {
      send({ type: 'UPDATE_EQUIPMENT_ID', equipmentId });
    },
    [send]
  );

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
            <Heading level={3}>Extraction Method</Heading>
            <p className="mt-2">Select an extraction method for all scanned labware.</p>
            <div className="mt-4 md:w-1/2">
              <CustomReactSelect
                dataTestId="equipmentId"
                emptyOption
                handleChange={(val) => {
                  const value = (val as OptionType).value;
                  handleExtractMethodChange(value === '' ? 0 : parseInt(value, 10));
                }}
                options={selectOptionValues(extractionMethodOptions, 'label', 'value')}
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Heading level={3}>Section Tubes</Heading>
            <LabwareScanner
              onChange={onLabwareScannerChange}
              locked={scannerLocked}
              labwareCheckFunction={validateLabware}
              enableFlaggedLabwareCheck
            >
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
                        {data.destinationLabware && <LabelCopyButton labels={[data.destinationLabware.barcode]} />}
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end sm:justify-end space-y-2">
                <div className="sm:max-w-xl w-full p-4 rounded-md border-gray-200 bg-gray-100 shadow-md space-y-2">
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
                    'flex flex-col sm:max-w-xl w-full p-4 rounded-md border-gray-200 bg-gray-100 shadow-md items-end sm:justify-end '
                  }
                >
                  <div className={'flex items-center space-x-2'}>
                    <div className={'font-bold'}>Labels:</div>
                    <div>{extraction?.extract?.labware.map((lw) => lw.barcode).join(',')}</div>
                  </div>
                  <LabelCopyButton
                    labels={extraction?.extract?.labware.map((lw) => lw.barcode) ?? []}
                    copyButtonText={'Copy Labels'}
                    buttonClass={
                      'text-white bg-sdb-500 shadow-xs hover:bg-sdb focus:border-sdb focus:shadow-md-outline-sdb active:bg-sdb-600'
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AppShell.Main>

      {showGrayPanel && (
        <div className="shrink-0 max-w-screen-xl mx-auto">
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
          <BlueButton onClick={() => reload(navigate)} action="tertiary">
            Reset Form
          </BlueButton>
          <Link to={'/'}>
            <BlueButton action="primary">Return Home</BlueButton>
          </Link>
          <div className={''}>
            <Link to={'/lab/extraction_result'} state={{ labware: extraction?.extract?.labware }}>
              <BlueButton action="primary">Go to Extraction Result &gt;</BlueButton>
            </Link>
          </div>
        </ButtonBar>
      )}
    </AppShell>
  );
}

export default Extraction;
