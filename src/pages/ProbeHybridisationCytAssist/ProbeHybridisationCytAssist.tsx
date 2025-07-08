import React, { useContext } from 'react';
import {
  GetProbePanelsQuery,
  LabwareFieldsFragment,
  ProbeOperationRequest,
  RecordProbeOperationMutation,
  SlideCosting
} from '../../types/sdk';
import AppShell from '../../components/AppShell';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import variants from '../../lib/motionVariants';
import { motion } from '../../dependencies/motion';
import Heading from '../../components/Heading';
import LabwareScanner from '../../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../../components/labwareScanPanel/LabwareScanPanel';
import columns from '../../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import FormikInput from '../../components/forms/Input';
import { useMachine } from '@xstate/react';
import BlueButton from '../../components/buttons/BlueButton';
import { StanCoreContext } from '../../lib/sdk';
import createFormMachine from '../../lib/machines/form/formMachine';
import Warning from '../../components/notifications/Warning';
import OperationCompleteModal from '../../components/modal/OperationCompleteModal';
import { createSessionStorageForLabwareAwaiting, formatDateTimeForCore, getCurrentDateTime } from '../../types/stan';
import ProbeAddPanel from './ProbeAddPanel';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { fromPromise } from 'xstate';
import CustomReactSelect, { OptionType } from '../../components/forms/CustomReactSelect';
import { selectOptionValues } from '../../components/forms';
import WhiteButton from '../../components/buttons/WhiteButton';
import { slideCostingOptions } from '../../lib/helpers';
import Panel from '../../components/Panel';
import ProbeSettings from './ProbeSettings';

export type ProbeHybridisationCytAssistFormValues = {
  labware: ProbeOperationLabwareForm[];
  performed: string;
  workNumberAll: string;
  costingAll?: SlideCosting;
  reagentLotAll?: string;
  customPanelAll?: string;
  probePanelAll: CytAssistProbe;
};

type ProbeOperationLabwareForm = {
  labware: LabwareFieldsFragment;
  workNumber: string;
  kitCosting?: SlideCosting;
  reagentLot?: string;
  probes: Array<CytAssistProbe>;
  customPanel?: string;
  activeProbeIndex?: number;
  addresses?: string;
};

export type CytAssistProbe = {
  panel: string;
  lot: string;
  costing?: SlideCosting;
};

export const probeLotDefault: CytAssistProbe = { panel: '', lot: '' };
export const lotRegx = /^[A-Z0-9_]{1,25}$/;

const formInitialValues: ProbeHybridisationCytAssistFormValues = {
  labware: [],
  performed: getCurrentDateTime(),
  workNumberAll: '',
  reagentLotAll: '',
  probePanelAll: probeLotDefault
};

export type ProbesOptions = {
  cytAssistProbes: GetProbePanelsQuery['probePanels'];
  spikeProbes: GetProbePanelsQuery['probePanels'];
};

export type ProbePanelInfo = {
  probesOptions: ProbesOptions;
  probeLabware: ProbeOperationLabwareForm;
  lwIndex: number;
};

const ProbeHybridisationCytAssist: React.FC = () => {
  const probesOptions = useLoaderData() as ProbesOptions;
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<ProbeOperationRequest, RecordProbeOperationMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordProbeOperation({
            request: { ...input.event.values, performed: formatDateTimeForCore(input.event.values.performed) }
          });
        })
      }
    });
  }, [stanCore]);

  const [current, send] = useMachine(formMachine);

  const [currentTime, setCurrentTime] = React.useState<string>(getCurrentDateTime());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const { serverError, submissionResult } = current.context;
  /**
   * Validation schema for the form
   */
  const validationSchema = Yup.object().shape({
    performed: Yup.date()
      .max(currentTime, 'Please select a date and time on or before current time')
      .required('Start Time is a required field')
      .label('Start Time'),
    probePanelAll: Yup.object().shape({
      panel: Yup.string(),
      lot: Yup.string()
        .max(25)
        .matches(
          lotRegx,
          'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
        ),
      costing: Yup.string().oneOf(Object.values(SlideCosting))
    }),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          labware: Yup.object().required(),
          workNumber: Yup.string().required().label('SGP Number'),
          customPanel: Yup.string().optional(),
          kitCosting: Yup.string().oneOf(Object.values(SlideCosting)).required('Costing is a required field'),
          reagentLot: Yup.string().matches(/^\d{6}$/, 'Reagent LOT should be a string of 6 digits'),
          probes: Yup.array()
            .of(
              Yup.object().shape({
                panel: Yup.string()
                  .required('Probe panel is a required field')
                  .test('Test', 'Unique value required for Probe Panel', (value, context) => {
                    if (context.from && context.from.length > 1) {
                      const values = context.from[1].value as ProbeOperationLabwareForm;
                      if (values.probes.length < 2) return true; // If there's only one probe, no need to check uniqueness
                      const uniqueValues = [...new Set(values.probes.map((val) => val.panel))]; // Using Set to filter out duplicates
                      return values.probes.length === uniqueValues.length;
                    }
                  }),
                lot: Yup.string()
                  .required('LOT number is a required field')
                  .max(25)
                  .matches(
                    lotRegx,
                    'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
                  ),
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

  const navigate = useNavigate();

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybridisation CytAssist</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik<ProbeHybridisationCytAssistFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    operationType: 'Probe hybridisation CytAssist',
                    performed: values.performed,
                    labware: values.labware.map((probeLw) => ({
                      barcode: probeLw.labware.barcode,
                      workNumber: probeLw.workNumber,
                      kitCosting: probeLw.kitCosting!,
                      reagentLot: probeLw.reagentLot,
                      spike: probeLw.customPanel,
                      addresses: probeLw.addresses?.split(',').map((addr) => addr.trim()),
                      probes: probeLw.probes.map((probe) => ({
                        name: probe.panel,
                        lot: probe.lot,
                        costing: probe.costing!
                      }))
                    }))
                  }
                });
              }}
            >
              {({ values, setValues, errors }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    <LabwareScanner
                      onAdd={async (lw) =>
                        await setValues((prev) => {
                          return {
                            ...prev,
                            performed: currentTime,
                            labware: [
                              ...prev.labware,
                              {
                                labware: lw as LabwareFieldsFragment,
                                workNumber: values.workNumberAll,
                                kitCosting: values.costingAll,
                                reagentLot: values.reagentLotAll,
                                customPanel: values.customPanelAll,
                                probes: []
                              }
                            ]
                          };
                        })
                      }
                      onRemove={async (lw) =>
                        await setValues((prev) => ({
                          ...prev,
                          labware: prev.labware.filter((probeLw) => probeLw.labware.barcode !== lw.barcode)
                        }))
                      }
                      enableFlaggedLabwareCheck
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
                  </motion.div>
                  {values.labware.length > 0 && (
                    <>
                      <div className="mx-auto max-w-screen-xl py-2 mb-6">
                        <div className="flex flex-row mt-4 p-3 bg-gray-100 rounded-md">
                          <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5 w-full">
                            <Heading level={3}>Apply to all</Heading>
                            <div className={'flex flex-col mt-4'}>
                              <div className={'w-full border-2 border-gray-100 mb-4'} />
                              <div className={'grid grid-cols-7 gap-x-4'}>
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
                                <CustomReactSelect
                                  isMulti={false}
                                  label={'Kit Costing'}
                                  name={'costingAll'}
                                  value={'costingAll'}
                                  handleChange={async (val) => {
                                    const kitCosting = (val as OptionType).label as SlideCosting;
                                    await setValues((prev) => {
                                      return {
                                        ...prev,
                                        costingAll: kitCosting,
                                        labware: prev.labware.map((lw) => ({
                                          ...lw,
                                          kitCosting
                                        }))
                                      };
                                    });
                                  }}
                                  emptyOption={true}
                                  dataTestId="costingAll"
                                  options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                />
                                <FormikInput
                                  data-testid={'reagentLotAll'}
                                  label={'Reagent Lot'}
                                  name={'reagentLotAll'}
                                  onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                    await setValues((prev) => ({
                                      ...prev,
                                      reagentLotAll: e.target.value,
                                      labware: prev.labware.map((lw) => ({
                                        ...lw,
                                        reagentLot: e.target.value
                                      }))
                                    }));
                                  }}
                                />
                                <CustomReactSelect
                                  dataTestId={'customPanelAll'}
                                  emptyOption={true}
                                  label="Custom Probe Panel"
                                  name={'customPanelAll'}
                                  options={selectOptionValues(probesOptions.spikeProbes, 'name', 'name')}
                                  handleChange={async (val) => {
                                    const customPanel = (val as OptionType).label;
                                    await setValues((prev) => {
                                      return {
                                        ...prev,
                                        customPanelAll: customPanel,
                                        labware: prev.labware.map((lw) => ({
                                          ...lw,
                                          customPanel
                                        }))
                                      };
                                    });
                                  }}
                                />
                                <div className={'col-span-3'}>
                                  <ProbeAddPanel
                                    cytAssistProbes={probesOptions.cytAssistProbes}
                                    spikeProbes={probesOptions.spikeProbes}
                                  />
                                </div>
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
                          max={currentTime}
                        />
                      </div>

                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 w-full">
                        {values.labware.map((probeLw, lwIndex) => (
                          <Panel>
                            <ProbeSettings probesOptions={probesOptions} probeLabware={probeLw} lwIndex={lwIndex} />
                          </Panel>
                        ))}
                      </motion.div>
                      <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                        <BlueButton
                          type="submit"
                          disabled={errors.labware !== undefined || errors.performed !== undefined}
                        >
                          Save
                        </BlueButton>
                      </div>
                    </>
                  )}
                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Probe hybridisation CytAssist recorded on all labware'}
                    additionalButtons={
                      <div className={'flex flex-row gap-x-3'}>
                        <WhiteButton
                          type="button"
                          style={{ marginLeft: 'auto' }}
                          className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                          onClick={() => {
                            createSessionStorageForLabwareAwaiting(values.labware.map((probeLw) => probeLw.labware));
                            navigate('/store');
                          }}
                        >
                          Store
                        </WhiteButton>
                      </div>
                    }
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

export default ProbeHybridisationCytAssist;
