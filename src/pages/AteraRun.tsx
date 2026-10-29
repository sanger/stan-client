import React, { useContext } from 'react';
import { Form, Formik } from 'formik';
import { StanCoreContext } from '../lib/sdk';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { joinUnique, samplesFromLabwareOrSLot } from '../components/dataTableColumns';
import RemoveButton from '../components/buttons/RemoveButton';
import PassIcon from '../components/icons/PassIcon';
import FailIcon from '../components/icons/FailIcon';
import Panel from '../components/Panel';
import { createTableDataForSlots } from '../components/xeniumAnalyser/analyserScan';
import { AnalyserLabwareForm } from '../components/xeniumAnalyser/analyser.types';

export type AteraRunFormValues = {
  workNumberAll: string;
  labware: Array<AnalyserLabwareForm>;
};

const formInitialValues: AteraRunFormValues = {
  workNumberAll: '',
  labware: []
};

const LabwareAteraRunTable = (labwareForm: AnalyserLabwareForm) => {
  const samples = samplesFromLabwareOrSLot(labwareForm.labware);
  const scanData = labwareForm.analyserScanData;
  return (
    <Table className="text-sm">
      <TableHead>
        <tr>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>External ID</TableHeader>
          <TableHeader>Work Numbers</TableHeader>
          <TableHeader>Probe Panels</TableHeader>
          <TableHeader>Cell Segmentation Recorded</TableHeader>
          <TableHeader>Atera Study ID</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        <tr>
          <TableCell className="break-words align-top">{labwareForm.labware.barcode}</TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.tissue.externalName ?? ''))}
          </TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(scanData?.workNumberXeniumStudyIds.map((data) => data.workNumber) ?? [])}
          </TableCell>
          <TableCell className="break-words align-top">{scanData?.probes.join(', ')}</TableCell>
          <TableCell className="break-words align-top">
            {scanData &&
              (scanData.cellSegmentationRecorded ? (
                <PassIcon className={`inline-block h-8 w-8 text-green-500`} />
              ) : (
                <FailIcon className={`inline-block h-8 w-8 text-red-500`} />
              ))}
          </TableCell>
          {/**Left empty until core returns Atera study ids with the scan data**/}
          <TableCell className="break-words align-top" />
        </tr>
      </TableBody>
    </Table>
  );
};

const AteraRun = () => {
  const stanCore = useContext(StanCoreContext);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Atera Run</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className={'flex flex-col space-y-6'}>
            <Formik<AteraRunFormValues> initialValues={formInitialValues} onSubmit={() => {}}>
              {({ values, setValues }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    {values.labware
                      .filter((lw) => !lw.hybridisation)
                      .map((lw) => (
                        <Warning key={`war-${lw.labware.barcode}`}>
                          No probe hybridisation recorded for {lw.labware.barcode}
                        </Warning>
                      ))}
                    <LabwareScanner
                      limit={4}
                      onAdd={(labware) => {
                        createTableDataForSlots(stanCore, 'Probe hybridisation Atera', labware, setValues, values);
                      }}
                      onRemove={async (labware) => {
                        await setValues((prev) => {
                          return {
                            ...prev,
                            labware: prev.labware.filter((lw) => lw.labware.barcode !== labware.barcode)
                          };
                        });
                      }}
                      enableFlaggedLabwareCheck
                    >
                      {({ removeLabware }) =>
                        values.labware.map((labwareForm) => (
                          <Panel key={labwareForm.labware.barcode}>
                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton onClick={() => removeLabware(labwareForm.labware.barcode)} />
                            </div>
                            <div className="flex flex-row mt-3">{LabwareAteraRunTable(labwareForm)}</div>
                          </Panel>
                        ))
                      }
                    </LabwareScanner>
                  </motion.div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default AteraRun;
