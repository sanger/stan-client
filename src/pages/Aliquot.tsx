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
import LabelPrinter, { PrintResult } from '../components/LabelPrinter';
import Success from '../components/notifications/Success';
import variants from '../lib/motionVariants';
import { usePrinters } from '../lib/hooks';
import MutedText from '../components/MutedText';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { useMachine } from '@xstate/react';
import { LabwareFieldsFragment } from '../types/sdk';
import { Link, useNavigate } from 'react-router-dom';
import ButtonBar from '../components/ButtonBar';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import aliquotMachine, { AliquotContext } from '../lib/machines/aliquot/aliquotMachine';
import { Input } from '../components/forms/Input';
import WhiteButton from '../components/buttons/WhiteButton';
import { extractLabwareFromFlagged } from '../lib/helpers/labwareHelper';

/**Create table data from Aliquot mutation results*/
function buildAliquotTableData(ctx: AliquotContext) {
  if (!ctx.aliquotResult) return [];
  const sourceLabware = ctx.labware;
  const destinationLabwares = ctx.aliquotResult.aliquot.labware;

  return ctx.aliquotResult.aliquot.operations
    .map((operation) => {
      return operation.actions.map((action) => {
        return {
          sourceLabware: sourceLabware,
          destinationLabware: destinationLabwares.find((lw) => lw.id === action.destination.labwareId)
        };
      });
    })
    .flat();
}

function Aliquot() {
  const [current, send] = useMachine(aliquotMachine, {
    input: {
      labware: undefined,
      numLabware: 0,
      workNumber: ''
    }
  });

  const { handleOnPrint, handleOnPrintError, handleOnPrinterChange, printResult, currentPrinter } = usePrinters();

  const { labware, serverErrors, aliquotResult, numLabware, workNumber } = current.context;

  /**Table column for scanned source tube*/
  const columns = useMemo(
    () => [labwareScanTableColumns.barcode(), labwareScanTableColumns.donorId(), labwareScanTableColumns.tissueType()],
    []
  );

  const aliquoteTableData = useMemo(() => {
    return buildAliquotTableData(current.context);
  }, [current]);

  /**Callback for Work number change**/
  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
  );

  /**Callback for changing number of destination labwares**/
  const handleNumLabwareChange = useCallback(
    (numLabware: number) => {
      send({ type: 'UPDATE_NUM_LABWARE', numLabware });
    },
    [send]
  );

  /**Callback for scanning a new labware**/
  const onLabwareScannerChange = (labware: LabwareFieldsFragment) => {
    send({ type: 'UPDATE_LABWARE', labware });
  };
  const scannerLocked = !current.matches('ready') && !current.matches('aliquotFailed');

  // TODO Move this type of valdation into state machine and add validation to 'ready' state
  const blueButtonDisabled = !(
    (current.matches('ready') || current.matches('aliquotFailed')) &&
    labware !== undefined &&
    workNumber !== '' &&
    numLabware > 0
  );
  const showGrayPanel = current.matches('ready') || current.matches('aliquotFailed');
  const navigate = useNavigate();
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Aliquoting</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Select an SGP number to associate with this aliquoting.</p>
            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Heading level={3}>Source Tube</Heading>

            <LabwareScanner
              onChange={(labwares) => onLabwareScannerChange(extractLabwareFromFlagged(labwares)[0])}
              locked={scannerLocked}
              limit={1}
              enableFlaggedLabwareCheck
            >
              <LabwareScanPanel columns={columns} />
            </LabwareScanner>
          </div>
          <div className="space-y-4 mt-8">
            <Heading level={3}>Destination Tubes</Heading>
            <p className="mt-2">Enter the number of tubes you are creating.</p>
            <Input
              type="number"
              value={numLabware}
              min={0}
              data-testid={'numLabware'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumLabwareChange(Number(e.currentTarget.value))
              }
              className={'md:w-1/2 '}
            />
          </div>
          {current.matches('aliquotingDone') && (
            <motion.div
              initial={'hidden'}
              animate={'visible'}
              variants={variants.fadeIn}
              className="mt-12 space-y-4"
              data-testid={'newLabelDiv'}
            >
              <Heading level={3}>New Labels</Heading>
              <Success message={'Aliquoting Complete'}>Your source tube has been marked as discarded.</Success>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Source Labware</TableHeader>
                    <TableHeader>Destination Labware</TableHeader>
                    <TableHeader />
                  </tr>
                </TableHead>
                <TableBody>
                  {aliquoteTableData.map((data) => (
                    <tr key={data.destinationLabware?.barcode}>
                      <TableCell>{data.sourceLabware?.barcode}</TableCell>
                      <TableCell>{data.destinationLabware?.barcode}</TableCell>
                      <TableCell>
                        {data.destinationLabware && (
                          <LabelPrinterButton
                            labelsPerBarcode={1}
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

              <div className="flex flex-row items-center sm:justify-end" data-testid={'printDiv'}>
                <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow-md space-y-2">
                  {printResult && <PrintResult result={printResult} />}
                  <LabelPrinter
                    labelsPerBarcode={1}
                    showNotifications={false}
                    labwares={aliquotResult?.aliquot?.labware ?? []}
                    onPrint={handleOnPrint}
                    onPrintError={handleOnPrintError}
                    onPrinterChange={handleOnPrinterChange}
                  />
                  <MutedText className="text-right">
                    Note: 1 label for each destination labware will be printed.
                  </MutedText>
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
              Once <span className="font-bold text-gray-900">source tube</span> is scanned and
              <span className="font-bold text-gray-900"> number of destination tubes </span> are entered,{' '}
              <span>click Aliquot to create destination tubes.</span>
            </p>

            <p className="my-4 text-gray-800 text-xs leading-relaxed italic text-center">
              Source labware will be marked as discarded.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="#aliquot"
                disabled={blueButtonDisabled}
                className="whitespace-nowrap"
                action={'primary'}
                onClick={() => send({ type: 'ALIQUOT' })}
              >
                Aliquot
              </BlueButton>
            </div>
          </div>
        </div>
      )}

      {current.matches('aliquotingDone') && (
        <ButtonBar>
          <BlueButton onClick={() => reload(navigate)} action="tertiary">
            Reset Form
          </BlueButton>
          <Link to={'/store'}>
            <WhiteButton action="primary">Store</WhiteButton>
          </Link>
          <Link to={'/'}>
            <BlueButton action="primary">Return Home</BlueButton>
          </Link>
        </ButtonBar>
      )}
    </AppShell>
  );
}

export default Aliquot;
