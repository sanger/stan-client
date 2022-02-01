import React, { useCallback, useMemo } from "react";
import AppShell from "../components/AppShell";
import BlueButton from "../components/buttons/BlueButton";
import Heading from "../components/Heading";
import LabwareScanPanel from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
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
import MutedText from "../components/MutedText";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import { useMachine } from "@xstate/react";
import { buildSampleColors } from "../lib/helpers/labwareHelper";
import { LabwareFieldsFragment } from "../types/sdk";
import { Link } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";
import { reload } from "../lib/sdk";
import WorkNumberSelect from "../components/WorkNumberSelect";
import aliquotMachine, {
  AliquotContext,
} from "../lib/machines/aliquot/aliquotMachine";
import { Input } from "../components/forms/Input";

function buildAliquotTableData(ctx: AliquotContext) {
  if (!ctx.aliquotResult) return [];
  const sourceLabware = ctx.labware;
  const destinationLabwares = ctx.aliquotResult.aliquot.labware;
  const sampleColors = buildSampleColors(destinationLabwares);

  return ctx.aliquotResult.aliquot.operations
    .map((operation) => {
      return operation.actions.map((action) => {
        return {
          sampleColor: sampleColors.get(action.sample.id),
          sourceLabware: sourceLabware,
          destinationLabware: destinationLabwares.find(
            (lw) => lw.id === action.destination.labwareId
          ),
        };
      });
    })
    .flat();
}

function Aliquot() {
  const [current, send] = useMachine(() =>
    aliquotMachine.withContext({
      labware: undefined,
      numLabware: 0,
    })
  );

  const {
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    printResult,
    currentPrinter,
  } = usePrinters();

  const { labware, serverErrors, aliquotResult, numLabware } = current.context;

  const sampleColors: Map<number, string> = useMemo(() => {
    const labwares = labware ? [labware] : [];
    return buildSampleColors(labwares);
  }, [labware]);

  const columns = useMemo(
    () => [
      labwareScanTableColumns.color(sampleColors),
      labwareScanTableColumns.barcode(),
      labwareScanTableColumns.donorId(),
      labwareScanTableColumns.tissueType(),
    ],
    []
  );

  const aliquoteTableData = useMemo(() => {
    return buildAliquotTableData(current.context);
  }, [current]);

  const handleWorkNumberChange = useCallback(
    (workNumber?: string) => {
      send({ type: "UPDATE_WORK_NUMBER", workNumber });
    },
    [send]
  );

  const handleNumLabwareChange = useCallback(
    (numLabware: number) => {
      send({ type: "UPDATE_NUM_LABWARE", numLabware });
    },
    [send]
  );

  const onLabwareScannerChange = (labware: LabwareFieldsFragment) =>
    send({ type: "UPDATE_LABWARE", labware });

  const scannerLocked =
    !current.matches("ready") && !current.matches("aliquotFailed");
  const blueButtonDisabled = !(
    (current.matches("ready") || current.matches("aliquotFailed")) &&
    labware !== undefined &&
    numLabware > 0
  );
  const showGrayPanel =
    current.matches("ready") || current.matches("aliquotFailed");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Extraction</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div>
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">
              You may optionally select an SGP number to associate with this
              extraction.
            </p>
            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Heading level={3}>Section Tubes</Heading>

            <LabwareScanner
              onChange={(labwares) => onLabwareScannerChange(labwares[0])}
              locked={scannerLocked}
            >
              <LabwareScanPanel columns={columns} />
            </LabwareScanner>
          </div>
          <div className="mt-8 space-y-4">
            <Heading level={3}>Destination Tubes</Heading>
            <Input
              type="number"
              id={"numLabware"}
              value={numLabware}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumLabwareChange(Number(e.currentTarget.value))
              }
              className={"w-1/2"}
            />
          </div>
          {current.matches("aliquotingDone") && (
            <motion.div
              initial={"hidden"}
              animate={"visible"}
              variants={variants.fadeIn}
              className="mt-12 space-y-4"
            >
              <Heading level={3}>RNA Tubes</Heading>

              <Success message={"Aliquoting Complete"}>
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
                  {aliquoteTableData.map((data) => (
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
                            labelsPerBarcode={2}
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
                    labelsPerBarcode={2}
                    showNotifications={false}
                    labwares={aliquotResult?.aliquot?.labware ?? []}
                    onPrint={handleOnPrint}
                    onPrintError={handleOnPrintError}
                    onPrinterChange={handleOnPrinterChange}
                  />
                  <MutedText className="text-right">
                    Note: 1 labels for each destination labware will be printed.
                  </MutedText>
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
              Once <span className="font-bold text-gray-900">all tubes</span>{" "}
              have been scanned, click Aliquot to create destination labwares.
            </p>

            <p className="my-3 text-gray-800 text-xs leading-relaxed italic text-center">
              Source labware will be marked as discarded.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="#extract"
                disabled={blueButtonDisabled}
                className="whitespace-nowrap"
                action={"primary"}
                onClick={() => send({ type: "ALIQUOT" })}
              >
                Aliquot
              </BlueButton>
            </div>
          </div>
        </div>
      )}

      {current.matches("extracted") && (
        <ButtonBar>
          <BlueButton onClick={reload} action="tertiary">
            Reset Form
          </BlueButton>
          <Link to={"/"}>
            <BlueButton action="primary">Return Home</BlueButton>
          </Link>
          <div className={""}>
            <Link
              to={{
                pathname: "/lab/extraction_result",
                state: { labware: aliquotResult?.aliquot?.labware },
              }}
            >
              <BlueButton action="primary">
                Go to Extraction Result &gt;
              </BlueButton>
            </Link>
          </div>
        </ButtonBar>
      )}
    </AppShell>
  );
}

export default Aliquot;
