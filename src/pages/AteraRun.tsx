import React, { useContext } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useLoaderData } from 'react-router-dom';
import { StanCoreContext } from '../lib/sdk';
import { CommentFieldsFragment, EquipmentFieldsFragment } from '../types/sdk';
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
import FormikInput, { FormikCheckbox } from '../components/forms/Input';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { hasUploadedFilesInSgpFolder } from '../lib/services/fileService';
import RegionDefiner, { reIndexAndRenameRegions } from '../components/xeniumAnalyser/RegionDefiner';
import AnalyserLabwarePanel from '../components/xeniumAnalyser/AnalyserLabwarePanel';
import { createTableDataForSlots } from '../components/xeniumAnalyser/analyserScan';
import { AnalyserLabwareForm } from '../components/xeniumAnalyser/analyser.types';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import BlueButton from '../components/buttons/BlueButton';
import { BarcodeDisplayer } from '../components/modal/BarcodeDisplayer';

type LoaderData = {
  equipments: Array<EquipmentFieldsFragment>;
  workTypes: Array<CommentFieldsFragment>;
};

type BarcodeDisplayerProps = {
  barcode: string;
  warningMessage?: string;
};

export type AteraRunFormValues = {
  performed: string;
  equipmentId: number | undefined;
  workTypeCommentId: number | undefined;
  runName: string;
  repeat: boolean;
  workNumberAll: string;
  /**
   * The index of the labware whose regions the RegionDefiner is open for, or -1 when it is closed.
   */
  activeRegionDefinerLabwareIndex: number;
  labware: Array<AnalyserLabwareForm>;
  barcodeDisplayerProps?: BarcodeDisplayerProps;
};

const formInitialValues: AteraRunFormValues = {
  performed: '',
  equipmentId: undefined,
  workTypeCommentId: undefined,
  runName: '',
  repeat: false,
  workNumberAll: '',
  activeRegionDefinerLabwareIndex: -1,
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
  const { equipments, workTypes } = useLoaderData() as LoaderData;
  const stanCore = useContext(StanCoreContext);
  const validationSchema = Yup.object().shape({
    performed: Yup.date().required('Time is a required field').label('Time'),
    equipmentId: Yup.number().required('Equipment is a required field').label('Equipment'),
    workTypeCommentId: Yup.number().required('Run worktype is a required field').label('Run worktype'),
    runName: Yup.string()
      .trim()
      .required()
      .label('Run Name')
      .max(32, 'Run name should be a string of maximum length 32')
      .matches(/^[A-Za-z0-9_\- ]+$/, 'Run name should only contain letters, numbers, underscores, hyphens and spaces'),
    activeRegionDefinerLabwareIndex: Yup.number(),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          hybridisation: Yup.boolean(),
          workNumber: Yup.string().required().label('SGP Number'),
          selectedRegionColorIndex: Yup.number(),
          selectedAddresses: Yup.array(),
          regions: Yup.array()
            .of(
              Yup.object().shape({
                roi: Yup.string()
                  .required('Region of interest is a required field')
                  .label('ROI')
                  .max(64, 'Region of interest field should be string of maximum length 64'),
                sectionGroups: Yup.array().min(1).required('At least one section group per region'),
                colorIndexNumber: Yup.number()
              })
            )
            .required()
            .min(1)
        })
      )
      .required()
      .min(1)
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Atera Run</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className={'flex flex-col space-y-6'}>
            <Formik<AteraRunFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={() => {}}
            >
              {({ values, setValues, setFieldValue }) => (
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
                  {values.labware.length > 0 && values.labware.some((lw) => lw.hybridisation) && (
                    <>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 py-4">
                        <Heading level={3}>Run Details</Heading>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Time'}
                              data-testid={'performed'}
                              type="datetime-local"
                              name={'performed'}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <CustomReactSelect
                              label={'Equipment'}
                              options={selectOptionValues(equipments, 'name', 'id')}
                              name="equipmentId"
                              dataTestId="equipmentId"
                              emptyOption={true}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <WorkNumberSelect
                              label={'SGP Number'}
                              name={'workNumberAll'}
                              dataTestId={'workNumberAll'}
                              onWorkNumberChange={async (_workNumber) => {
                                const workNumber = _workNumber.trim();
                                const hasSgpNumberLink =
                                  workNumber.length > 0 ? await hasUploadedFilesInSgpFolder(workNumber) : false;
                                await setValues((prev) => {
                                  return {
                                    ...prev,
                                    workNumberAll: workNumber,
                                    labware: prev.labware.map((lw) => ({
                                      ...lw,
                                      workNumber,
                                      hasSgpNumberLink,
                                      regions: reIndexAndRenameRegions(lw.regions, prev.runName, lw.labware.barcode)
                                    }))
                                  };
                                });
                              }}
                              requiredField={false}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className="flex flex-row">
                            <div className="w-1/2">
                              <FormikInput
                                label={'Run Name'}
                                data-testid={'runName'}
                                type="text"
                                name={'runName'}
                                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const runName = e.target.value;
                                  await setValues((prev) => ({
                                    ...prev,
                                    runName,
                                    labware: prev.labware.map((lw) => ({
                                      ...lw,
                                      regions: reIndexAndRenameRegions(lw.regions, runName, lw.labware.barcode)
                                    }))
                                  }));
                                }}
                              />
                            </div>
                            <div>
                              <FormikCheckbox name="repeat" dataTestId="is-repeat-run" label="Is a repeat run" />
                            </div>
                          </div>
                          <div className={'flex flex-col'}>
                            <CustomReactSelect
                              label={'Run Worktype'}
                              options={selectOptionValues(workTypes, 'text', 'id')}
                              name="workTypeCommentId"
                              dataTestId="workTypeCommentId"
                              emptyOption={true}
                            />
                          </div>
                        </div>
                      </motion.div>
                      {values.labware
                        .map((lw, lwIndex) => ({ lw, lwIndex }))
                        .filter(({ lw }) => lw.hybridisation)
                        .map(({ lw, lwIndex }) => (
                          <motion.div variants={variants.fadeInWithLift} className="mt-4" key={lw.labware.barcode}>
                            <AnalyserLabwarePanel
                              labwareIndex={lwIndex}
                              onDefineRegions={async () => {
                                await setFieldValue('activeRegionDefinerLabwareIndex', lwIndex);
                              }}
                              onRoiBlur={async (barcode) => {
                                await setFieldValue('barcodeDisplayerProps', { barcode });
                              }}
                            />
                          </motion.div>
                        ))}
                      <Modal show={values.activeRegionDefinerLabwareIndex > -1}>
                        <ModalBody>
                          <RegionDefiner labwareIndex={values.activeRegionDefinerLabwareIndex} />
                        </ModalBody>
                        <ModalFooter>
                          <BlueButton
                            type="button"
                            className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={async () => {
                              await setFieldValue('activeRegionDefinerLabwareIndex', -1);
                            }}
                          >
                            Done
                          </BlueButton>
                        </ModalFooter>
                      </Modal>
                    </>
                  )}
                  {values.barcodeDisplayerProps && (
                    <BarcodeDisplayer
                      barcode={values.barcodeDisplayerProps.barcode}
                      warningMessage={values.barcodeDisplayerProps.warningMessage}
                      header={'Scan the region barcode into your machine'}
                      show={true}
                      onClose={async () => {
                        await setValues((prev) => ({
                          ...prev,
                          barcodeDisplayerProps: undefined
                        }));
                      }}
                    />
                  )}
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
