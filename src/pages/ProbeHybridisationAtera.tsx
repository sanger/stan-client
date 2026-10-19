import React, { useContext } from 'react';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  ProbeOperationLabware,
  ProbeOperationRequest,
  ProbePanelFieldsFragment,
  RecordProbeOperationMutation,
  SlideCosting
} from '../types/sdk';
import AppShell from '../components/AppShell';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import variants from '../lib/motionVariants';
import { motion } from '../dependencies/motion';
import Heading from '../components/Heading';
import LabwareScanner, { useLabwareContext } from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns, { FlaggedBarcodeLink } from '../components/dataTableColumns/labwareColumns';
import WorkNumberSelect from '../components/WorkNumberSelect';
import FormikInput from '../components/forms/Input';
import { useMachine } from '@xstate/react';
import BlueButton from '../components/buttons/BlueButton';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import Warning from '../components/notifications/Warning';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { createSessionStorageForLabwareAwaiting, formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { fromPromise } from 'xstate';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import WhiteButton from '../components/buttons/WhiteButton';
import { slideCostingOptions } from '../lib/helpers';
import AddIcon from '../components/icons/AddIcon';
import Panel from '../components/Panel';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import RemoveButton from '../components/buttons/RemoveButton';
import IconButton from '../components/buttons/IconButton';

type ProbeHybridisationAteraForm = {
  labwareProbeSettings: LabwareProbeSettings[];
  performed: string;
  workNumber: string;
  kitCosting?: SlideCosting;
  samplePrepReagentType?: string;
  samplePrepReagentLot?: string;
  probeKitCosting?: SlideCosting;
  probeLot?: string;
  probeName?: string;
};

type ProbeLot = {
  name: string;
  lot: string;
  costing?: SlideCosting;
};

type LabwareProbeSettings = {
  labware: LabwareFlaggedFieldsFragment;
  workNumber: string;
  kitCosting?: SlideCosting;
  samplePrepReagentType?: string;
  samplePrepReagentLot?: string;
  probes: Array<ProbeLot>;
};

export const probeLotDefault = { name: '', lot: '', costing: undefined };
export const lotRegx = /^[A-Z0-9_]{1,25}$/;

const formInitialValues: ProbeHybridisationAteraForm = {
  labwareProbeSettings: [],
  performed: getCurrentDateTime(),
  workNumber: '',
  kitCosting: undefined,
  samplePrepReagentType: '',
  samplePrepReagentLot: ''
};

// Defined at module level so the component identity is stable across parent re-renders
const ProbeAddToAllPanel: React.FC<{ probePanels: Array<ProbePanelFieldsFragment> }> = ({ probePanels }) => {
  const { values, setValues, touched, setTouched } = useFormikContext<ProbeHybridisationAteraForm>();
  return (
    <div className={'border-1 border-gray-300 shadow-md justify-end p-2'}>
      <div className={'grid grid-cols-3 gap-x-3 p-4'} data-testid={'probe-all-table'}>
        <label>Probe Panel</label>
        <label>LOT</label>
        <label>Probe Kit Costing</label>
        <div>
          <CustomReactSelect
            dataTestId={'probe-name'}
            emptyOption={true}
            name={'probeName'}
            label={''}
            options={probePanels.map((panel) => ({ label: panel.name, value: panel.name }))}
          />
        </div>
        <div>
          <FormikInput label={''} data-testid={'probe-lot'} name="probeLot" value={values.probeLot} />
        </div>
        <div>
          <CustomReactSelect
            label={''}
            name={'probeKitCosting'}
            emptyOption={true}
            dataTestId="probe-costing"
            options={selectOptionValues(slideCostingOptions, 'label', 'value')}
          />
        </div>
      </div>

      <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
        <WhiteButton
          type="button"
          onClick={async () => {
            const newProbe = {
              name: values.probeName || '',
              lot: values.probeLot || '',
              costing: values.probeKitCosting
            };
            const touchedProbe = { name: true, lot: true, costing: true };
            const touchedSettings: Array<any> = [];
            const labwareProbeSettings = values.labwareProbeSettings.map((lwProbe, index) => {
              // If existing probes are all default/empty, replace them; otherwise prepend.
              const onlyDefaults = lwProbe.probes.every((p) => !p.name && !p.lot && !p.costing);
              const existingTouched = (touched.labwareProbeSettings as Array<any> | undefined)?.[index];
              const existingProbesTouched: Array<any> = existingTouched?.probes ?? [];
              touchedSettings.push({
                ...existingTouched,
                probes: onlyDefaults ? [touchedProbe] : [touchedProbe, ...existingProbesTouched]
              });
              return {
                ...lwProbe,
                probes: onlyDefaults ? [newProbe] : [newProbe, ...lwProbe.probes]
              };
            });
            // Mark the added probe as touched so Formik error messages are displayed for it
            await setTouched({ ...touched, labwareProbeSettings: touchedSettings }, false);
            await setValues({ ...values, labwareProbeSettings }, true);
          }}
        >
          <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
          Add to all
        </WhiteButton>
      </div>
    </div>
  );
};

const LabwareProbeSettingsPanel: React.FC<{
  labwareProbeIndex: number;
  probePanels: Array<ProbePanelFieldsFragment>;
  samplePrepReagentTypes: Array<CommentFieldsFragment>;
}> = ({ labwareProbeIndex, probePanels, samplePrepReagentTypes }) => {
  const { values, setValues } = useFormikContext<ProbeHybridisationAteraForm>();
  const { removeLabware } = useLabwareContext();
  const labwareProbeSettings = values.labwareProbeSettings[labwareProbeIndex];
  const probes = labwareProbeSettings.probes;
  return (
    <div className="mt-8 bg-gray-100  border-2 border-gray-100 rounded-md">
      <Panel>
        <div className="flex flex-row items-center justify-between">
          {FlaggedBarcodeLink(labwareProbeSettings.labware.barcode, labwareProbeSettings.labware.flagPriority)}
          <RemoveButton
            onClick={async () => {
              removeLabware(labwareProbeSettings.labware.barcode);
              await setValues((prev) => {
                const updated = prev.labwareProbeSettings.filter(
                  (lwProbe) => lwProbe.labware.barcode !== labwareProbeSettings.labware.barcode
                );
                return { ...prev, labwareProbeSettings: updated };
              });
            }}
          />
        </div>
        <div className="mt-8 mb-8">
          <div>
            <div className={'grid grid-cols-4 gap-x-6'}>
              <div>
                <WorkNumberSelect
                  label={'SGP Number'}
                  workNumber={labwareProbeSettings.workNumber}
                  name={`labwareProbeSettings.${labwareProbeIndex}.workNumber`}
                  dataTestId={`workNumber-${labwareProbeSettings.labware.barcode}`}
                />
              </div>
              <div>
                <CustomReactSelect
                  label={'Kit Costing'}
                  name={`labwareProbeSettings.${labwareProbeIndex}.kitCosting`}
                  value={labwareProbeSettings.kitCosting}
                  emptyOption={true}
                  options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                  dataTestId={`kit-costing-${labwareProbeSettings.labware.barcode}`}
                />
              </div>
              <div>
                <CustomReactSelect
                  label={'Sample Prep Reagent Type'}
                  name={`labwareProbeSettings.${labwareProbeIndex}.samplePrepReagentType`}
                  value={labwareProbeSettings.samplePrepReagentType}
                  emptyOption={true}
                  dataTestId={`sample-prep-reagent-type-${labwareProbeSettings.labware.barcode}`}
                  options={selectOptionValues(samplePrepReagentTypes, 'text', 'id')}
                />
              </div>
              <div>
                <FormikInput
                  label={'Sample Prep Reagent LOT'}
                  name={`labwareProbeSettings.${labwareProbeIndex}.samplePrepReagentLot`}
                  value={labwareProbeSettings.samplePrepReagentLot}
                  data-testid={`sample-prep-reagent-lot-${labwareProbeSettings.labware.barcode}`}
                />
              </div>
            </div>
          </div>
          <div>
            <Heading level={5} showBorder={false}>
              Probes
            </Heading>
            <Table data-testid="labware-probes-table" isFixed>
              <colgroup>
                <col />
                <col />
                <col />
                <col className="w-32" />
              </colgroup>
              <TableHead>
                <tr>
                  <TableHeader>Probe Panel</TableHeader>
                  <TableHeader>LOT</TableHeader>
                  <TableHeader>Probe Costing</TableHeader>
                  <TableHeader></TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                <FieldArray
                  name={`labwareProbeSettings.${labwareProbeIndex}.probes`}
                  render={(labwareProbeArrayHelpers) => (
                    <>
                      {probes.map((labwareProbe, probeIndex) => (
                        <tr key={probeIndex}>
                          <TableCell>
                            <CustomReactSelect
                              label={''}
                              value={labwareProbe.name}
                              name={`labwareProbeSettings.${labwareProbeIndex}.probes.${probeIndex}.name`}
                              options={probePanels.map((panel) => ({
                                label: panel.name,
                                value: panel.name
                              }))}
                              emptyOption={true}
                              dataTestId={`probe-name-${labwareProbeSettings.labware.barcode}-${probeIndex}`}
                            />
                          </TableCell>
                          <TableCell>
                            <FormikInput
                              label={''}
                              value={labwareProbe.lot}
                              name={`labwareProbeSettings.${labwareProbeIndex}.probes.${probeIndex}.lot`}
                              dataTestId={`probe-lot-${labwareProbeSettings.labware.barcode}-${probeIndex}`}
                            />
                          </TableCell>
                          <TableCell>
                            <CustomReactSelect
                              label={''}
                              value={labwareProbe.costing ?? ''}
                              name={`labwareProbeSettings.${labwareProbeIndex}.probes.${probeIndex}.costing`}
                              options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                              emptyOption={true}
                              dataTestId={`probe-costing-${labwareProbeSettings.labware.barcode}-${probeIndex}`}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2!">
                            <div className={'flex flex-row space-x-2'}>
                              {probeIndex === 0 && probes.length === 1 ? (
                                <></>
                              ) : (
                                <RemoveButton
                                  type={'button'}
                                  dataTestId={'remove-probe-button'}
                                  onClick={() => {
                                    labwareProbeArrayHelpers.remove(probeIndex);
                                  }}
                                />
                              )}
                              {probeIndex === probes.length - 1 && (
                                <IconButton
                                  dataTestId={'add-probe-button'}
                                  onClick={() => {
                                    labwareProbeArrayHelpers.push(probeLotDefault);
                                  }}
                                  className={'focus:outline-hidden'}
                                >
                                  <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                                </IconButton>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      ))}
                    </>
                  )}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </Panel>
    </div>
  );
};

type LoaderData = {
  probePanels: Array<ProbePanelFieldsFragment>;
  samplePrepReagentTypes: Array<CommentFieldsFragment>;
};

const ProbeHybridisationAtera: React.FC = () => {
  const { probePanels, samplePrepReagentTypes } = useLoaderData() as LoaderData;
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<ProbeOperationRequest, RecordProbeOperationMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          const performedValue = formatDateTimeForCore(input.event.values.performed);
          return stanCore.RecordProbeOperation({
            // Stan-core's graphql schema describes the format of a timestamp as yyyy-mm-dd HH:MM:SS
            request: { ...input.event.values, performed: performedValue }
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
  const validationSchema = Yup.object().shape({
    performed: Yup.date()
      .max(currentTime, 'Please select a date and time on or before current time')
      .required('Start Time is a required field')
      .label('Start Time'),
    samplePrepReagentLot: Yup.string().matches(/^\d{6}$/, 'Sample Prep Reagent Lot should be a string of 6 digits'),
    samplePrepReagentType: Yup.string(),
    workNumber: Yup.string(),
    kitCosting: Yup.string().oneOf(Object.values(SlideCosting)),
    probeKitCosting: Yup.string().oneOf(Object.values(SlideCosting)),
    probeLot: Yup.string()
      .max(25)
      .matches(
        lotRegx,
        'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
      ),
    probeName: Yup.string(),
    labwareProbeSettings: Yup.array()
      .of(
        Yup.object().shape({
          labware: Yup.object().required(),
          workNumber: Yup.string().required('SGP Number is a required field').label('SGP Number'),
          kitCosting: Yup.string().oneOf(Object.values(SlideCosting)).required('Probe kit costing is a required field'),
          samplePrepReagentLot: Yup.string().matches(
            /^\d{6}$/,
            'Sample Prep Reagent Lot should be a string of 6 digits'
          ),
          samplePrepReagentType: Yup.string().required('Sample Prep Reagent Type is a required field'),
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
        <AppShell.Title>Probe Hybridisation Atera</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik<ProbeHybridisationAteraForm>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    operationType: 'Probe hybridisation Atera',
                    performed: values.performed,
                    labware: values.labwareProbeSettings.map((lps) => ({
                      barcode: lps.labware.barcode,
                      workNumber: lps.workNumber,
                      kitCosting: lps.kitCosting,
                      reagentLot: lps.samplePrepReagentLot,
                      reagentTypeCommentId: samplePrepReagentTypes.find(
                        (type) => type.text === lps.samplePrepReagentType
                      )?.id,
                      probes: lps.probes.map((probe) => ({
                        ...probe,
                        costing: probe.costing!
                      }))
                    }))
                  }
                });
              }}
            >
              {({ values, setValues, isValid }) => {
                return (
                  <Form>
                    <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                      <Heading level={3}>Labware</Heading>
                      <LabwareScanner
                        onAdd={async (labware) => {
                          await setValues((prev) => {
                            const labwareProbeSettings = [...prev.labwareProbeSettings];
                            labwareProbeSettings.push({
                              labware: labware,
                              workNumber: prev.workNumber,
                              kitCosting: prev.kitCosting,
                              samplePrepReagentType: prev.samplePrepReagentType,
                              samplePrepReagentLot: prev.samplePrepReagentLot,
                              probes: [probeLotDefault]
                            });
                            return { ...prev, performed: currentTime, labwareProbeSettings };
                          });
                        }}
                        onRemove={async (labware) => {
                          await setValues((prev) => {
                            const labwareProbeSettings = prev.labwareProbeSettings.filter(
                              (lwProbe) => lwProbe.labware.barcode !== labware.barcode
                            );
                            return { ...prev, labwareProbeSettings };
                          });
                        }}
                        enableFlaggedLabwareCheck
                      >
                        <LabwareScanPanel
                          columns={[
                            columns.barcode(),
                            columns.labwareType(),
                            columns.externalName(),
                            columns.bioState()
                          ]}
                        />
                        {values.labwareProbeSettings.length > 0 && (
                          <>
                            <div className="mx-auto max-w-screen-xl py-2 mb-6">
                              <div className="flex flex-row mt-4 p-3 bg-gray-100 rounded-md">
                                <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5">
                                  <Heading level={3}>Apply to all</Heading>
                                  <div className={'w-full border-2 border-gray-100 m-4'}>
                                    <div className={'grid grid-cols-2'}>
                                      <div className={'grid grid-cols-2 gap-x-6 mr-6'}>
                                        <div>
                                          <WorkNumberSelect
                                            label={'SGP Number'}
                                            dataTestId={'workNumber'}
                                            name={'workNumber'}
                                            onWorkNumberChange={async (workNumber) => {
                                              await setValues((prev) => {
                                                return {
                                                  ...prev,
                                                  workNumber,
                                                  labwareProbeSettings: prev.labwareProbeSettings.map((lwProbe) => ({
                                                    ...lwProbe,
                                                    workNumber
                                                  }))
                                                };
                                              });
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <CustomReactSelect
                                            label="Kit Costing"
                                            value="kitCosting"
                                            handleChange={async (val) => {
                                              const kitCosting = (val as OptionType).label as SlideCosting;
                                              await setValues((prev) => {
                                                return {
                                                  ...prev,
                                                  kitCosting,
                                                  labwareProbeSettings: prev.labwareProbeSettings.map((lwProbe) => ({
                                                    ...lwProbe,
                                                    kitCosting
                                                  }))
                                                };
                                              });
                                            }}
                                            emptyOption={true}
                                            dataTestId="costing"
                                            options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                          />
                                        </div>
                                        <div>
                                          <CustomReactSelect
                                            label="Sample Prep Reagent Type"
                                            value="samplePrepReagentType"
                                            name="samplePrepReagentType"
                                            handleChange={async (val) => {
                                              const samplePrepReagentType = (val as OptionType).label;
                                              await setValues((prev) => {
                                                return {
                                                  ...prev,
                                                  samplePrepReagentType,
                                                  labwareProbeSettings: prev.labwareProbeSettings.map((lwProbe) => ({
                                                    ...lwProbe,
                                                    samplePrepReagentType
                                                  }))
                                                };
                                              });
                                            }}
                                            emptyOption={true}
                                            dataTestId="sample-prep-reagent-type"
                                            options={selectOptionValues(samplePrepReagentTypes, 'text', 'id')}
                                          />
                                        </div>
                                        <div>
                                          <FormikInput
                                            label={'Sample Prep Reagent LOT'}
                                            name={'samplePrepReagentLot'}
                                            dataTestId={'sample-prep-reagent-lot'}
                                            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                              const samplePrepReagentLot = e.target.value;
                                              await setValues((prev) => {
                                                return {
                                                  ...prev,
                                                  samplePrepReagentLot,
                                                  labwareProbeSettings: prev.labwareProbeSettings.map((lwProbe) => ({
                                                    ...lwProbe,
                                                    samplePrepReagentLot
                                                  }))
                                                };
                                              });
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <ProbeAddToAllPanel probePanels={probePanels} />
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
                            {values.labwareProbeSettings.map((lps, index) => (
                              <LabwareProbeSettingsPanel
                                labwareProbeIndex={index}
                                probePanels={probePanels}
                                samplePrepReagentTypes={samplePrepReagentTypes}
                                key={lps.labware.barcode}
                              />
                            ))}

                            <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                              <BlueButton type="submit" disabled={!isValid}>
                                Save
                              </BlueButton>
                            </div>
                          </>
                        )}
                      </LabwareScanner>
                    </motion.div>
                    <OperationCompleteModal
                      show={submissionResult !== undefined}
                      message={'Atera probe hybridisation recorded on all labware'}
                      additionalButtons={
                        <div className={'flex flex-row gap-x-3'}>
                          <WhiteButton
                            type="button"
                            style={{ marginLeft: 'auto' }}
                            className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                            onClick={() => {
                              createSessionStorageForLabwareAwaiting(
                                values.labwareProbeSettings.map((lps) => lps.labware as LabwareFieldsFragment)
                              );
                              navigate('/store');
                            }}
                          >
                            Store
                          </WhiteButton>
                        </div>
                      }
                    >
                      <p>
                        If you wish to start the process again, click the "Reset Form" button. Otherwise you can return
                        to the Home screen.
                      </p>
                    </OperationCompleteModal>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProbeHybridisationAtera;
