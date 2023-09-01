import React, { useContext } from 'react';
import { reload, StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  AnalyserLabware,
  AnalyserRequest,
  CassettePosition,
  LabwareFieldsFragment,
  RecordAnalyserMutation,
  SamplePositionFieldsFragment
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import { FieldArray, Form, Formik } from 'formik';
import { getCurrentDateTime } from '../types/stan';
import FormikInput from '../components/forms/Input';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Table, { TabelSubHeader, TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import { objectKeys } from '../lib/helpers';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage } from '../components/forms';

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
  barcode: string;
  samples: SampleWithRegion[];
};

export type XeniumAnalyserFormValues = {
  lotNumber: string;
  runName: string;
  performed: string;
  labware: Array<AnalyserLabware>;
  workNumberAll: string;
};
const formInitialValues: XeniumAnalyserFormValues = {
  runName: '',
  lotNumber: '',
  labware: [],
  performed: getCurrentDateTime(),
  workNumberAll: ''
};

const XeniumAnalyser = () => {
  const [labwareSamples, setLabwareSamples] = React.useState<LabwareSamples[]>([]);
  const [hybridisation, setHybridisation] = React.useState<{ barcode: string; performed: boolean } | undefined>(
    undefined
  );
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<AnalyserRequest, RecordAnalyserMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordAnalyser({
            request: { ...e.values }
          });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  const validationSchema = Yup.object().shape({
    lotNumber: Yup.string()
      .required('Decoding reagent lot number is a required field')
      .label('Lot Number')
      .max(20, 'Decoding reagent lot number should be a string of maximum length 20 of letters and numbers.')
      .matches(
        /^[A-Za-z0-9]{1,20}$/,
        'Decoding reagent lot number should be a string of maximum length 20 of letters and numbers.'
      ),
    runName: Yup.string().required().label('Run Name').max(255, 'Run name should be a string of maximum length 255'),
    performed: Yup.date()
      .max(new Date(), 'Please select a date and time on or before current time')
      .required('Time is a required field')
      .label('Time'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          workNumber: Yup.string().required().label('SGP Number'),
          position: Yup.string().required().label('Cassette Position'),
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
    (labware: LabwareFieldsFragment) => {
      const setLabwareSampleData = async (lw: LabwareFieldsFragment) => {
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
          } else {
            setHybridisation({
              barcode: lw.barcode,
              performed: false
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
        setLabwareSamples((prev) => [...prev, { barcode: lw.barcode, workNumber: '', samples }]);
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
                  const labwareSample = labwareSamples.find((ls) => ls.barcode === lw.barcode);
                  return {
                    barcode: lw.barcode,
                    workNumber: lw.workNumber,
                    position: lw.position === 'left' ? CassettePosition.Left : CassettePosition.Right,
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
                    runName: values.runName,
                    lotNumber: values.lotNumber,
                    labware: labwareROIData,
                    operationType: 'Xenium analyser'
                  }
                });
              }}
            >
              {({ values, setFieldValue, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    {hybridisation && !hybridisation.performed && (
                      <Warning>No probe hybridisation recorded for {hybridisation?.barcode}</Warning>
                    )}
                    <FieldArray name={'labware'}>
                      {(helpers) => (
                        <LabwareScanner
                          limit={2}
                          onAdd={(labware) => {
                            /**If labware scanned not already displayed, add to list**/
                            if (!labwareSamples.some((lwSamples) => lwSamples.barcode === labware.barcode)) {
                              createTableDataForSlots(labware);
                            }
                            helpers.push({ barcode: labware.barcode, workNumber: '', position: '', samples: [] });
                          }}
                          onRemove={(labware) => {
                            setLabwareSamples((prev) => prev.filter((lw) => lw.barcode !== labware.barcode));
                            values.labware.forEach((valueLw, index) => {
                              if (valueLw.barcode === labware.barcode) {
                                helpers.remove(index);
                              }
                            });
                          }}
                        >
                          <LabwareScanPanel
                            columns={[
                              columns.barcode(),
                              columns.donorId(),
                              columns.labwareType(),
                              columns.externalName(),
                              columns.bioState()
                            ]}
                          />
                        </LabwareScanner>
                      )}
                    </FieldArray>
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
                              max={getCurrentDateTime()}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Run Name'}
                              type="text"
                              name="runName"
                              data-testid="runName"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding reagent lot number'}
                              type="text"
                              name="lotNumber"
                              data-testid="lotNumber"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </motion.div>
                      <motion.div variants={variants.fadeInWithLift} className="mt-4 py-4 md:w-1/2">
                        <WorkNumberSelect
                          label={'SGP Number'}
                          name={'workNumberAll'}
                          dataTestId={'workNumberAll'}
                          onWorkNumberChange={(workNumber) => {
                            setFieldValue('workNumberAll', workNumber);
                            values.labware.forEach((lw, index) =>
                              setFieldValue(`labware.${index}.workNumber`, workNumber)
                            );
                          }}
                          requiredField={false}
                        />
                      </motion.div>
                      <motion.div variants={variants.fadeInWithLift} className="mt-4 py-4">
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Barcode</TableHeader>
                              <TableHeader>SGP Number</TableHeader>
                              <TableHeader>Cassette Position</TableHeader>
                              <TableHeader>Samples</TableHeader>
                            </tr>
                          </TableHead>
                          <TableBody>
                            {labwareSamples.map((lw, lwIndex) => (
                              <tr key={lw.barcode}>
                                <TableCell>{lw.barcode}</TableCell>
                                <TableCell>
                                  <WorkNumberSelect
                                    name={`labware.${lwIndex}.workNumber`}
                                    dataTestId={`${lw.barcode}-workNumber`}
                                    onWorkNumberChange={(workNumber) => {
                                      setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
                                    }}
                                    workNumber={values.labware[lwIndex]?.workNumber}
                                    requiredField={true}
                                  />
                                  <FormikErrorMessage name={`labware.${lwIndex}.workNumber`} />
                                </TableCell>
                                <TableCell>
                                  <CustomReactSelect
                                    options={objectKeys(CassettePosition).map((val) => {
                                      return { value: val, label: val };
                                    })}
                                    name={`labware.${lwIndex}.position`}
                                    dataTestId={`${lw.barcode}-position`}
                                    emptyOption={true}
                                  />
                                </TableCell>

                                <TableCell>
                                  <div className={'flex flex-col space-y-2'} data-testid={`${lw.barcode}-samples`}>
                                    <div className={'grid grid-cols-5 gap-y-4 gap-x-4'}>
                                      <TabelSubHeader>Region of interest</TabelSubHeader>
                                      <TabelSubHeader>Slot address</TabelSubHeader>
                                      <TabelSubHeader>Section number</TabelSubHeader>
                                      <TabelSubHeader>Section position</TabelSubHeader>
                                      <TabelSubHeader>External Id</TabelSubHeader>
                                    </div>
                                    {lw.samples.map((sample, sampleIndex) => {
                                      return (
                                        <div
                                          className={'grid grid-cols-5 gap-y-4 gap-x-4'}
                                          key={`${lw.barcode}-${sample.sampleId}`}
                                        >
                                          <div className={'flex flex-col'}>
                                            <FormikInput
                                              label={''}
                                              name={`labware.${lwIndex}.samples.${sampleIndex}.roi`}
                                              data-testid={`${lw.barcode}-${sampleIndex}-roi`}
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
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
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
                    onReset={reload}
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
