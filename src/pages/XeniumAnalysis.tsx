import React, { useContext } from 'react';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  AnalyserLabware,
  AnalyserRequest,
  CassettePosition,
  LabwareFieldsFragment,
  LabwareFieldsFragmentDoc,
  RecordAnalyserMutation,
  SamplePositionFieldsFragment,
  SlideCosting
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import { lotRegx, ProbeHybridisationXeniumFormValues, probeLotDefault } from './ProbeHybridisationXenium';
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
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import { enumKey, objectKeys } from '../lib/helpers';

export type XeniumAnalysisFormValues = {
  inputLabware: Array<LabwareFieldsFragment>;
  lotNumber: string;
  runName: string;
  performed: string;
  labware: Array<AnalyserLabware>;
  workNumberAll: string;
};
const formInitialValues: XeniumAnalysisFormValues = {
  inputLabware: [],
  runName: '',
  lotNumber: '',
  labware: [],
  performed: getCurrentDateTime(),
  workNumberAll: ''
};
type LabwareSamplePosition = {
  barcode: string;
  samplePositions: SamplePositionFieldsFragment[];
};

const XeniumAnalysis = () => {
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<AnalyserRequest, RecordAnalyserMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordAnalyser({
            // Stan-core's graphql schema describes the format of a timestamp as yyyy-mm-dd HH:MM:SS
            request: { ...e.values }
          });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const [labwareSamplePositions, setLabwareSamplePositions] = React.useState<LabwareSamplePosition[]>([]);

  const { serverError, submissionResult } = current.context;

  const validationSchema = Yup.object().shape({
    lotNumber: Yup.string()
      .required()
      .label('Lot Number')
      .max(20)
      .matches(
        lotRegx,
        'LOT number should be a string of maximum length 20 of capital letters, numbers and underscores.'
      ),
    runName: Yup.string().required().label('Run Name').max(255),
    performed: Yup.date()
      .max(new Date(), 'Please select a date and time on or before current time')
      .required('Time is a required field')
      .label('Time'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required().label('Barcode'),
          workNumber: Yup.string().required().label('SGP Number'),
          position: Yup.string().required().label('Cassette Position'),
          samples: Yup.array()
            .of(
              Yup.object().shape({
                address: Yup.string().required().label('Address'),
                sampleId: Yup.string().required().label('Sample ID'),
                roi: Yup.string().required().label('ROI')
              })
            )
            .required()
            .min(1)
        })
      )
      .required()
      .min(1)
  });

  const createTableDataForSlots = React.useCallback(
    (labware: LabwareFieldsFragment[]) => {
      setLabwareSamplePositions((prev) => {
        return prev.filter((prevLw) => labware.find((lw) => lw.barcode === prevLw.barcode));
      });

      const setLabwareSampleData = async (lw: LabwareFieldsFragment) => {
        const sampleData: SamplePositionFieldsFragment[] = [];
        const samplePositions = await stanCore
          .FindSamplePositions({ labwareBarcode: lw.barcode })
          .then((res) => res.samplePositions);
        lw.slots.forEach((slot) => {
          slot.samples.forEach((sample) => {
            const samplePosition = samplePositions.find(
              (sp) => sp.address === slot.address && sp.sampleId === sample.id
            );
            sampleData.push({
              address: slot.address,
              sampleId: sample.id,
              region: samplePosition?.region ?? '',
              slotId: samplePosition?.slotId ?? -1
            });
          });
        });
        setLabwareSamplePositions((prev) => [...prev, { barcode: lw.barcode, samplePositions: sampleData }]);
      };
      labware.forEach((lw, Map) => {
        setLabwareSampleData(lw);
      });
    },
    [setLabwareSamplePositions, stanCore]
  );

  const subColumnClassName = 'text-xs font-medium text-gray-500 uppercase';
  /**
   * Validation schema for the form
   */
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xeniuym Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik<XeniumAnalysisFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    ...values,
                    operationType: 'Xenium Analysis'
                  }
                });
              }}
            >
              {({ values, setFieldValue, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    <FieldArray name={'labware'}>
                      {(helpers) => (
                        <LabwareScanner
                          limit={2}
                          onChange={(labware) => {
                            setFieldValue('inputLabware', labware);
                            labware.forEach((lw) => {
                              /**If Labware scnned not already displayed, add to probe list**/
                              if (!values.labware.some((valueLw) => valueLw.barcode === lw.barcode)) {
                                helpers.push({
                                  barcode: lw.barcode,
                                  workNumber: '',
                                  probes: [probeLotDefault]
                                });
                              }
                            });
                            /**If Labware not scanned is displayed, remove from probe list**/
                            values.labware.forEach((valueLw, index) => {
                              if (!labware.some((lw) => lw.barcode === valueLw.barcode)) {
                                helpers.remove(index);
                              }
                            });

                            createTableDataForSlots(labware);
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
                  {values.labware.length > 0 && (
                    <>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 py-4">
                        <Heading level={3}>Xenium Analysis Details</Heading>
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
                              label={'Lot number'}
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
                            {values.inputLabware.map((lw, lwIndex) => (
                              <tr key={lw.barcode}>
                                <TableCell>{lw.barcode}</TableCell>
                                <TableCell>
                                  <WorkNumberSelect
                                    name={`labware.${lwIndex}.workNumber`}
                                    dataTestId={`${lw.barcode}-workNumber`}
                                    onWorkNumberChange={(workNumber) => {
                                      setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
                                    }}
                                    workNumber={values.labware[lwIndex].workNumber}
                                  />
                                </TableCell>
                                <TableCell>
                                  <CustomReactSelect
                                    options={objectKeys(CassettePosition).map((val) => {
                                      return { value: val, label: val };
                                    })}
                                    name={`labware.${lwIndex}.position`}
                                  />
                                </TableCell>

                                <TableCell>
                                  <div className={'grid grid-cols-5 gap-y-4 gap-x-4'}>
                                    <label className={subColumnClassName}>Region of interest</label>
                                    <label className={subColumnClassName}>Slot address</label>
                                    <label className={subColumnClassName}>Section number</label>
                                    <label className={subColumnClassName}>Position</label>
                                    <label className={subColumnClassName}>External Id</label>
                                    {labwareSamplePositions
                                      .find((lwSample) => lwSample.barcode === lw.barcode)
                                      ?.samplePositions.map((sample, sampleIndex) => {
                                        return (
                                          <>
                                            <FormikInput
                                              label={''}
                                              name={`labware.${lwIndex}.samples.${sampleIndex}.roi`}
                                            />
                                            <label>{sample.address}</label>
                                            <label>{sample.sampleId}</label>
                                            <label>{sample.region}</label>
                                            <label>{lw.externalBarcode}</label>
                                          </>
                                        );
                                      })}
                                  </div>
                                </TableCell>
                              </tr>
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
                    </>
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

export default XeniumAnalysis;
