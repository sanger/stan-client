import React, { SetStateAction, useContext } from 'react';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  AnalyserLabware,
  AnalyserRequest,
  AnalyserScanDataFieldsFragment,
  CassettePosition,
  EquipmentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  RecordAnalyserMutation,
  SamplePositionFieldsFragment,
  SampleRoi
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { Form, Formik } from 'formik';
import FormikInput from '../components/forms/Input';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Table, { TabelSubHeader, TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import { GridDirection, objectKeys } from '../lib/helpers';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage, selectOptionValues } from '../components/forms';
import { useLoaderData } from 'react-router-dom';
import { fromPromise } from 'xstate';
import { lotRegx } from './ProbeHybridisationXenium';
import { joinUnique, samplesFromLabwareOrSLot } from '../components/dataTableColumns';
import RemoveButton from '../components/buttons/RemoveButton';
import PassIcon from '../components/icons/PassIcon';
import Labware from '../components/labware/Labware';
import Panel from '../components/Panel';

/**Sample data type to represent a sample row which includes all fields to be saved and displayed. */
type SampleWithRegion = {
  address: string;
  sampleId: number;
  region: string;
  sectionNumber?: string;
  externalName?: string;
  roi: string;
};
type LabwareSamples = {
  samples: SampleWithRegion[];
  labware: LabwareFlaggedFieldsFragment;
};

type AnalyserLabwareForm = {
  labware: LabwareFlaggedFieldsFragment;
  workNumber: string;
  position?: CassettePosition;
  samples: Array<SampleRoi>;
  analyserScanData?: AnalyserScanDataFieldsFragment;
};

type XeniumAnalyserFormValues = {
  lotNumberA: string;
  lotNumberB: string;
  cellSegmentationLot: string;
  decodingConsumablesLot?: string;
  equipmentId: number | undefined;
  runName: string;
  performed: string;
  labware: Array<AnalyserLabwareForm>;
  workNumberAll: string;
};
const formInitialValues: XeniumAnalyserFormValues = {
  runName: '',
  lotNumberB: '',
  lotNumberA: '',
  cellSegmentationLot: '',
  equipmentId: undefined,
  labware: [],
  performed: '',
  workNumberAll: ''
};

const LabwareAnalyserTable = (labwareForm: AnalyserLabwareForm) => {
  const samples = samplesFromLabwareOrSLot(labwareForm.labware);
  return (
    <Table className="text-sm">
      <TableHead>
        <tr>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>Donor ID</TableHeader>
          <TableHeader>Labware Type</TableHeader>
          <TableHeader>External Name</TableHeader>
          <TableHeader>Bio State</TableHeader>
          <TableHeader>Work Numbers</TableHeader>
          <TableHeader>Probes</TableHeader>
          <TableHeader>Cell Segmentation Recorded</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        <tr>
          <TableCell className="break-words align-top">{labwareForm.labware.barcode}</TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.tissue.donor.donorName))}
          </TableCell>
          <TableCell className="break-words align-top">{labwareForm.labware.labwareType.name}</TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.tissue.externalName ?? ''))}
          </TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.bioState.name))}
          </TableCell>
          <TableCell className="break-words align-top">
            {labwareForm.analyserScanData?.workNumbers.join(', ')}
          </TableCell>
          <TableCell className="break-words align-top">{labwareForm.analyserScanData?.probes.join(', ')}</TableCell>
          <TableCell className="break-words align-top">
            {labwareForm.analyserScanData?.cellSegmentationRecorded ? (
              <PassIcon className={`inline-block h-8 w-8 text-green-500`} />
            ) : (
              ' - '
            )}
          </TableCell>
        </tr>
      </TableBody>
    </Table>
  );
};

const XeniumAnalyser = () => {
  const equipments = useLoaderData() as EquipmentFieldsFragment[];
  const [labwareSamples, setLabwareSamples] = React.useState<LabwareSamples[]>([]);
  const [hybridisation, setHybridisation] = React.useState<{ barcode: string; performed: boolean } | undefined>(
    undefined
  );
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<AnalyserRequest, RecordAnalyserMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordAnalyser({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  const validationSchema = Yup.object().shape({
    lotNumberA: Yup.string()
      .required('Decoding reagent A lot number is a required field')
      .label('A Lot Number')
      .max(32, 'Decoding reagent lot number should be a string of up to 32 letters and numbers.')
      .matches(/^[A-Za-z0-9]+$/, 'Decoding reagent lot number should be a string of letters and numbers.'),
    lotNumberB: Yup.string()
      .required('Decoding reagent B lot number is a required field')
      .label('B Lot Number')
      .max(32, 'Decoding reagent lot number should be a string of up to 32 letters and numbers.')
      .matches(/^[A-Za-z0-9]+$/, 'Decoding reagent lot number should be a string of letters and numbers.'),
    cellSegmentationLot: Yup.string()
      .optional()
      .label('Cell segmentation lot number')
      .max(25)
      .matches(
        lotRegx,
        'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
      ),
    runName: Yup.string().required().label('Run Name').max(255, 'Run name should be a string of maximum length 255'),
    performed: Yup.date().required('Time is a required field').label('Time'),
    equipmentId: Yup.number().required().label('Equipment').required('Equipment is a required field'),
    decodingConsumablesLot: Yup.string()
      .optional()
      .matches(/^\d{6}$/, 'Consumables lot number should be a 6-digit number'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          workNumber: Yup.string().required().label('SGP Number'),
          position: Yup.string().required(),
          samples: Yup.array()
            .of(
              Yup.object().shape({
                roi: Yup.string()
                  .required('Region of interest is a required field')
                  .label('ROI')
                  .max(64, 'Region of interest field should be string of maximum length 64')
              })
            )
            .required()
            .min(1)
        })
      )
      .required()
      .min(1)
  });

  /**This creates the slot related information for the labware */
  const createTableDataForSlots = React.useCallback(
    (
      labware: LabwareFlaggedFieldsFragment,
      setValues: (values: SetStateAction<XeniumAnalyserFormValues>, shouldValidate?: boolean) => {},
      values: XeniumAnalyserFormValues
    ) => {
      const setLabwareSampleData = async (lw: LabwareFlaggedFieldsFragment) => {
        const samples: SampleWithRegion[] = [];
        /**
         * FindSamplePositions - if no samples in the labware have a region, the array would be empty.
         * Fetch sample positions first and then add the region to the sample information got from the labware
         * to create samples
         */
        let samplePositions: SamplePositionFieldsFragment[] = [];
        try {
          /**Validate whether probe hybridisation has been recorded on this labware**/
          const latestOp = await stanCore
            .FindLatestOperation({ barcode: lw.barcode, operationType: 'Probe hybridisation Xenium' })
            .then((res) => res.findLatestOp);
          /**If probe hybridisation has been recorded, get the sample positions,otherwise return**/
          if (latestOp) {
            samplePositions = await stanCore
              .FindSamplePositions({ labwareBarcode: lw.barcode })
              .then((res) => res.samplePositions);
            setHybridisation({
              barcode: lw.barcode,
              performed: true
            });
            stanCore.GetAnalyserScanData({ barcode: labware.barcode }).then((res) => {
              setValues((prev) => {
                const analyserLabware: AnalyserLabwareForm | undefined = prev.labware.find(
                  (lw) => lw.labware.barcode === labware.barcode
                );
                if (analyserLabware) {
                  analyserLabware.analyserScanData = res.analyserScanData;
                } else {
                  prev.labware.push({
                    labware,
                    workNumber: values.workNumberAll,
                    position: undefined,
                    samples: [],
                    analyserScanData: res.analyserScanData
                  });
                }
                return { ...prev };
              });
            });
          } else {
            setHybridisation({
              barcode: lw.barcode,
              performed: false
            });
            setValues((prev) => {
              prev.labware.push({
                labware,
                workNumber: values.workNumberAll,
                position: undefined,
                samples: []
              });
              return { ...prev };
            });
            return;
          }
        } catch (e) {
          samplePositions = [];
          return;
        }
        /**Create samples with region information */
        lw.slots.forEach((slot) => {
          slot.samples.forEach((sample) => {
            const samplePosition = samplePositions.find(
              (sp) => sp.address === slot.address && sp.sampleId === sample.id
            );
            samples.push({
              address: slot.address,
              sampleId: sample.id,
              region: samplePosition?.region ?? '',
              externalName: sample.tissue.externalName ?? '',
              sectionNumber: String(sample.section) ?? '',
              roi: ''
            });
          });
        });
        setLabwareSamples((prev) => [...prev, { labware: lw, barcode: lw.barcode, workNumber: '', samples }]);
      };
      setLabwareSampleData(labware);
    },
    [setLabwareSamples, stanCore, setHybridisation]
  );

  const isEmptyROI = (labware: LabwareSamples[]) => {
    return labware.filter((lw) => lw.samples.some((sample) => sample.roi === '')).length > 0;
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium Analyser</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className={'flex flex-col space-y-6'}>
            {serverError && <Warning error={serverError} />}
            <Formik<XeniumAnalyserFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                const labwareROIData: AnalyserLabware[] = values.labware.map((lw) => {
                  const labwareSample = labwareSamples.find((ls) => ls.labware.barcode === lw.labware.barcode);
                  return {
                    barcode: lw.labware.barcode,
                    workNumber: lw.workNumber,
                    decodingConsumablesLot: values.decodingConsumablesLot,
                    position: lw.position?.toLowerCase() === 'left' ? CassettePosition.Left : CassettePosition.Right,
                    samples: labwareSample
                      ? labwareSample.samples.map((sample) => {
                          return {
                            address: sample.address,
                            sampleId: sample.sampleId,
                            roi: sample.roi
                          };
                        })
                      : []
                  };
                });
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    performed: values.performed.replace('T', ' ') + ':00',
                    equipmentId: values.equipmentId!,
                    runName: values.runName,
                    lotNumberA: values.lotNumberA,
                    lotNumberB: values.lotNumberB,
                    cellSegmentationLot: values.cellSegmentationLot,
                    labware: labwareROIData,
                    operationType: 'Xenium analyser'
                  }
                });
              }}
            >
              {({ values, setFieldValue, setValues, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    {hybridisation && !hybridisation.performed && (
                      <Warning>No probe hybridisation recorded for {hybridisation?.barcode}</Warning>
                    )}
                    <LabwareScanner
                      limit={2}
                      onAdd={(labware) => {
                        /**If labware scanned not already displayed, add to list**/
                        if (!labwareSamples.some((lwSamples) => lwSamples.labware.barcode === labware.barcode)) {
                          createTableDataForSlots(labware, setValues, values);
                        }
                      }}
                      onRemove={async (labware) => {
                        setLabwareSamples((prev) => prev.filter((lw) => lw.labware.barcode !== labware.barcode));
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
                            <div className="flex flex-row mt-3">{LabwareAnalyserTable(labwareForm)}</div>
                          </Panel>
                        ))
                      }
                    </LabwareScanner>
                  </motion.div>
                  {labwareSamples.length > 0 && (
                    <>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 py-4">
                        <Heading level={3}>Analyser Details</Heading>
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
                            <FormikInput
                              label={'Run Name'}
                              type="text"
                              name="runName"
                              data-testid="runName"
                              className="shadow-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding reagent A lot number'}
                              type="text"
                              name="lotNumberA"
                              data-testid="lotNumberA"
                              className="shadow-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding reagent B lot number'}
                              type="text"
                              name="lotNumberB"
                              data-testid="lotNumberB"
                              className="shadow-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Cell segmentation lot number'}
                              type="text"
                              name="cellSegmentationLot"
                              data-testid="cellSegmentationLot"
                              className="shadow-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding consumables lot number'}
                              name="decodingConsumablesLot"
                              data-testid="decodingConsumablesLot"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <WorkNumberSelect
                              label={'SGP Number'}
                              name={'workNumberAll'}
                              dataTestId={'workNumberAll'}
                              onWorkNumberChange={async (workNumber) => {
                                await setValues((prev) => {
                                  return {
                                    ...prev,
                                    workNumberAll: workNumber,
                                    labware: prev.labware.map((lw) => ({
                                      ...lw,
                                      workNumber
                                    }))
                                  };
                                });
                              }}
                              requiredField={false}
                            />
                          </div>
                        </div>
                      </motion.div>
                      {labwareSamples.map((lw, lwIndex) => (
                        <motion.div variants={variants.fadeInWithLift} className="flex flex-row mt-4 py-4">
                          <div className="grid grid-cols-7 gap-x-1">
                            <div className="col-span-2">
                              <Labware labware={lw.labware} gridDirection={GridDirection.LeftUp} />
                            </div>
                            <div className="col-span-5">
                              <Table className="text-sm">
                                <TableHead>
                                  <tr>
                                    <TableHeader>SGP Number</TableHeader>
                                    <TableHeader>Cassette Position</TableHeader>
                                    <TableHeader>Samples</TableHeader>
                                  </tr>
                                </TableHead>
                                <TableBody>
                                  <tr key={lw.labware.barcode}>
                                    <TableCell className="align-top">
                                      <WorkNumberSelect
                                        name={`labware.${lwIndex}.workNumber`}
                                        dataTestId={`${lw.labware.barcode}-workNumber`}
                                        onWorkNumberChange={(workNumber) => {
                                          setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
                                        }}
                                        workNumber={values.labware[lwIndex]?.workNumber}
                                        requiredField={true}
                                      />
                                      <FormikErrorMessage name={`labware.${lwIndex}.workNumber`} />
                                    </TableCell>
                                    <TableCell className="align-top">
                                      <CustomReactSelect
                                        options={objectKeys(CassettePosition).map((val) => {
                                          return { value: val, label: val };
                                        })}
                                        name={`labware.${lwIndex}.position`}
                                        dataTestId={`${lw.labware.barcode}-position`}
                                        emptyOption={true}
                                      />
                                    </TableCell>

                                    <TableCell>
                                      <div
                                        className={'flex flex-col space-y-2'}
                                        data-testid={`${lw.labware.barcode}-samples`}
                                      >
                                        <div className={'grid grid-cols-5 gap-2'}>
                                          <TabelSubHeader>Region of interest</TabelSubHeader>
                                          <TabelSubHeader>Slot address</TabelSubHeader>
                                          <TabelSubHeader>Section number</TabelSubHeader>
                                          <TabelSubHeader>Section position</TabelSubHeader>
                                          <TabelSubHeader>External Id</TabelSubHeader>
                                        </div>
                                        {lw.samples.map((sample, sampleIndex) => {
                                          return (
                                            <div
                                              className={'grid grid-cols-5 gap2'}
                                              key={`${lw.labware.barcode}-${sample.sampleId}`}
                                            >
                                              <div className={'flex flex-col'}>
                                                <FormikInput
                                                  label={''}
                                                  name={`labware.${lwIndex}.samples.${sampleIndex}.roi`}
                                                  data-testid={`${lw.labware.barcode}-${sampleIndex}-roi`}
                                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    setFieldValue(
                                                      `labware.${lwIndex}.samples.${sampleIndex}.roi`,
                                                      e.currentTarget.value
                                                    );
                                                    setLabwareSamples((prev) => {
                                                      const updated = [...prev];
                                                      updated[lwIndex].samples[sampleIndex].roi = e.currentTarget.value;
                                                      return updated;
                                                    });
                                                  }}
                                                  value={labwareSamples[lwIndex].samples[sampleIndex].roi}
                                                />
                                              </div>
                                              <div className={'flex items-center px-6'}>
                                                <label>{sample.address}</label>
                                              </div>
                                              <label className={'flex items-center px-6'}>{sample.sectionNumber}</label>
                                              <label className={'flex items-center'}>{sample.region}</label>
                                              <label className={'flex items-center'}>{sample.externalName}</label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </TableCell>
                                  </tr>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                        <BlueButton type="submit" disabled={!isValid || isEmptyROI(labwareSamples)}>
                          Save
                        </BlueButton>
                      </div>
                    </>
                  )}
                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Xenium analyser recorded on all labware'}
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default XeniumAnalyser;
