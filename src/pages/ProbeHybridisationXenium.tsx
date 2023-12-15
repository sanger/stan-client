import React, { useContext } from 'react';
import {
  GetProbePanelsQuery,
  ProbeOperationLabware,
  ProbeOperationRequest,
  RecordProbeOperationMutation,
  SlideCosting
} from '../types/sdk';
import AppShell from '../components/AppShell';
import { FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../components/WorkNumberSelect';
import FormikInput from '../components/forms/Input';
import { useMachine } from '@xstate/react';
import BlueButton from '../components/buttons/BlueButton';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import Warning from '../components/notifications/Warning';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import ProbeTable from '../components/probeHybridisation/ProbeTable';
import { getCurrentDateTime } from '../types/stan';
import ProbeAddPanel from '../components/probeHybridisation/ProbeAddPanel';
import { useLoaderData } from 'react-router-dom';

export type ProbeHybridisationXeniumFormValues = {
  labware: ProbeOperationLabware[];
  performed: string;
  workNumberAll: string;
};
export const probeLotDefault = { name: '', lot: '', plex: 0 };
export const lotRegx = /^[A-Z0-9_]{1,20}$/;

const formInitialValues: ProbeHybridisationXeniumFormValues = {
  labware: [],
  performed: getCurrentDateTime(),
  workNumberAll: ''
};
const ProbeHybridisationXenium: React.FC = () => {
  const probePanelInfo = useLoaderData() as GetProbePanelsQuery;
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<ProbeOperationRequest, RecordProbeOperationMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          const performedValue = e.values.performed!.replace('T', ' ') + ':00';
          return stanCore.RecordProbeOperation({
            // Stan-core's graphql schema describes the format of a timestamp as yyyy-mm-dd HH:MM:SS
            request: { ...e.values, performed: performedValue }
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
      .max(new Date(), 'Please select a date and time on or before current time')
      .required('Start Time is a required field')
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
                  .required('LOT number is a required field')
                  .max(20)
                  .matches(
                    lotRegx,
                    'LOT number should be a string of maximum length 20 of capital letters, numbers and underscores.'
                  ),
                plex: Yup.number()
                  .required('Plex is a required field')
                  .min(1, 'Plex number should be a positive integer.'),
                costing: Yup.string().oneOf(Object.values(SlideCosting)).required('Probe costing is a required field')
              })
            )
            .min(1)
            .required()
        })
      )
      .min(1)
      .required()
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybridisation Xenium</AppShell.Title>
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
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    <FieldArray name={'labware'}>
                      {(helpers) => (
                        <LabwareScanner
                          onChange={(labware) => {
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
                          }}
                          enableFlaggedLabwareCheck={true}
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
                      <div className="mx-auto max-w-screen-lg py-2 mb-6">
                        <div className="flex flex-row mt-4 p-3 bg-gray-100 rounded-md">
                          <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5">
                            <Heading level={3}>Apply to all</Heading>

                            <div className={'flex flex-col mt-4'}>
                              <div className={'w-full border-2 border-gray-100 mb-4'} />
                              <div className={'flex flex-row gap-x-6'}>
                                <div className={'basis-1/4'}>
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
                                </div>
                                <ProbeAddPanel probePanels={probePanelInfo.probePanels} />
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                      <Heading level={3} className="pt-2">
                        Probe Settings
                      </Heading>
                      <div className={'flex flex-col w-1/2 py-4 mt-2'}>
                        <FormikInput
                          label={'Start Time'}
                          data-testid={'performed'}
                          type="datetime-local"
                          name={'performed'}
                          max={getCurrentDateTime()}
                        />
                      </div>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 w-full">
                        <ProbeTable probePanels={probePanelInfo.probePanels} />
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
                    message={'Xenium probe hybridisation recorded on all labware'}
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
