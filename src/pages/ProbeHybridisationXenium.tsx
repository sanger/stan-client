import React, { useContext } from 'react';
import {
  GetProbePanelsQuery,
  ProbeLot,
  ProbeOperationLabware,
  ProbeOperationRequest,
  RecordProbeOperationMutation
} from '../types/sdk';
import AppShell from '../components/AppShell';
import { FieldArray, Form, Formik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../components/WorkNumberSelect';
import ProbeTable from '../components/probeHybridisation/ProbeTable';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import FormikInput from '../components/forms/Input';
import { useMachine } from '@xstate/react';
import BlueButton from '../components/buttons/BlueButton';
import WhiteButton from '../components/buttons/WhiteButton';
import AddIcon from '../components/icons/AddIcon';
import DataTable from '../components/DataTable';
import probeLotColumns from '../components/probeHybridisation/ProbeTableColumns';
import { reload, StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import Warning from '../components/notifications/Warning';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage } from '../components/forms';
type ProbeHybridisationXeniumProps = {
  probePanelInfo: GetProbePanelsQuery;
};

type ProbeHybridisationXeniumFormValues = {
  labware: ProbeOperationLabware[];
  probeLotAll: ProbeLot[];
  performed: string;
  workNumberAll: string;
};
export const probeLotDefault = { name: '', lot: '', plex: -1 };
const formInitialValues: ProbeHybridisationXeniumFormValues = {
  labware: [],
  probeLotAll: [probeLotDefault],
  performed: new Date().toISOString().split('T')[0],
  workNumberAll: ''
};
const ProbeHybridisationXenium: React.FC<ProbeHybridisationXeniumProps> = ({
  probePanelInfo
}: ProbeHybridisationXeniumProps) => {
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<ProbeOperationRequest, RecordProbeOperationMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordProbeOperation({
            request: e.values
          });
        }
      }
    });
  }, [stanCore]);

  const [current, send] = useMachine(formMachine);

  const { serverError, submissionResult } = current.context;
  /**
   * Validation schema for the form
   */
  const validationSchema = Yup.object().shape({
    performed: Yup.date()
      .max(new Date(), `Please select a date on or before ${new Date().toLocaleDateString()}`)
      .required('Start Time is a required field for fetal samples')
      .label('Start Time'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required().label('Barcode'),
          workNumber: Yup.string().required().label('SGP Number'),
          probes: Yup.array()
            .of(
              Yup.object().shape({
                name: Yup.string()
                  .required('Probe panel is a required field')
                  .test('Test', 'Unique value required for Probe Panel', (value, context) => {
                    if (context.from && context.from.length > 1) {
                      const values = context.from[1].value as ProbeOperationLabware;
                      const uniqueValues = [...new Set(values.probes.map((val) => val.name))]; // Using Set to filter out duplicates
                      return values.probes.length === uniqueValues.length;
                    }
                  }),
                lot: Yup.string()
                  .required('Lot number is a required field')
                  .max(20)
                  .matches(
                    /^[A-Z0-9_]{1,20}$/,
                    'LOT number should be a string of maximum length 20 of capital letters, numbers and undersores.'
                  ),
                plex: Yup.number()
                  .required('Plex is a required field')
                  .min(0, 'Plex number should be a positive integer.')
              })
            )
            .min(1)
            .required()
        })
      )
      .min(1)
      .required(),
    probeLotAll: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().optional(),
        lot: Yup.string().optional(),
        plex: Yup.number().optional()
      })
    )
  });

  const isProbeLotForAllFilledIn = (probeLot: ProbeLot) => {
    return probeLot && probeLot.name.length > 0 && probeLot.lot.length > 0 && probeLot.plex > 0;
  };
  const printValues = (errors: FormikErrors<ProbeHybridisationXeniumFormValues>) => {
    debugger;
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybrodisation Xenium</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik<ProbeHybridisationXeniumFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    operationType: 'Probe hybridisation Xenium',
                    performed: values.performed,
                    labware: values.labware
                  }
                });
              }}
            >
              {({ values, setFieldValue, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-4">
                    <Heading level={3}>Labware</Heading>

                    <FieldArray name={'labware'}>
                      {(helpers) => (
                        <LabwareScanner
                          onChange={(labware) => {
                            labware.forEach((lw) =>
                              helpers.push({
                                barcode: lw.barcode,
                                workNumber: '',
                                probes: [probeLotDefault]
                              })
                            );
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
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>Probe Settings</Heading>
                        <div className={'flex flex-col w-1/2'}>
                          <FormikInput
                            label={'Start Time'}
                            type="date"
                            name={'performed'}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className={'flex flex-col mt-4'}>
                          <label className={'mb-2 mt-2'}>Apply to all:</label>
                          <div className={'w-full border-2 border-gray-100 mb-4'} />
                          <div className={'grid grid-cols-2 gap-x-6'}>
                            <div>
                              <WorkNumberSelect
                                label={'SGP Number'}
                                name={'workNumberAll'}
                                onWorkNumberChange={(workNumber) => {
                                  setFieldValue(`workNumberAll`, workNumber);
                                  values.labware.forEach((lw, index) =>
                                    setFieldValue(`labware.${index}.workNumber`, workNumber)
                                  );
                                }}
                                requiredField={false}
                              />
                            </div>
                            <div>
                              <label>Probe</label>
                              <div className={'flex flex-col bg-gray-100 p-3 shadow justify-end'}>
                                <DataTable
                                  columns={probeLotColumns(
                                    probePanelInfo.probePanels,
                                    values.probeLotAll,
                                    'probeLotAll'
                                  )}
                                  data={values.probeLotAll}
                                />
                                <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
                                  <FieldArray name={'labware'}>
                                    {(helpers) => (
                                      <WhiteButton
                                        disabled={
                                          values.labware.length <= 0 || !isProbeLotForAllFilledIn(values.probeLotAll[0])
                                        }
                                        onClick={() => {
                                          values.labware.forEach((lw, index) => {
                                            const updatedLabware: ProbeOperationLabware = {
                                              ...lw,
                                              probes: [...lw.probes, { ...values.probeLotAll[0] }]
                                            };
                                            helpers.replace(index, { ...updatedLabware });
                                          });
                                        }}
                                      >
                                        <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
                                        Add to all
                                      </WhiteButton>
                                    )}
                                  </FieldArray>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 w-full">
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Barcode</TableHeader>
                              <TableHeader>SGP Number</TableHeader>
                              <TableHeader>Probe</TableHeader>
                              <TableHeader />
                            </tr>
                          </TableHead>
                          <TableBody>
                            {values.labware.map((probeLw, indx) => (
                              <tr key={probeLw.barcode}>
                                <TableCell>{probeLw.barcode}</TableCell>
                                <TableCell>
                                  <WorkNumberSelect
                                    name={`labware.${indx}.workNumber`}
                                    onWorkNumberChange={(workNumber) => {
                                      setFieldValue(`labware.${indx}.workNumber`, workNumber);
                                    }}
                                    workNumber={values.labware[indx].workNumber}
                                  />
                                  <FormikErrorMessage name={`labware.${indx}.workNumber`} />
                                </TableCell>
                                <TableCell>
                                  <ProbeTable
                                    probePanels={probePanelInfo.probePanels}
                                    probeLabware={probeLw}
                                    labwareIndex={indx}
                                  />
                                </TableCell>
                              </tr>
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
                      <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                        <BlueButton type="submit" disabled={!isValid}>
                          Save
                        </BlueButton>
                      </div>
                    </>
                  )}
                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Xenium probe hubridisation recorded on all labware'}
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

export default ProbeHybridisationXenium;
