import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import React, { SetStateAction, useCallback, useContext } from 'react';
import { Form, Formik } from 'formik';
import { LabwareFlaggedFieldsFragment, RecordMetricsMutation, SampleMetricsRequest } from '../types/sdk';
import { StanCoreContext } from '../lib/sdk';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import { UploadProgress, UploadResult } from '../components/upload/useUpload';
import BlueButton from '../components/buttons/BlueButton';
import * as Yup from 'yup';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import RoiTable, { mapRoisToSectionGroups } from '../components/xeniumMetrics/RoiTable';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { FlaggedBarcodeLink } from '../components/dataTableColumns/labwareColumns';
import MetricsReader from '../components/xeniumMetrics/MetricsReader';
import { Row } from 'react-table';
import { PlannedSectionDetails } from '../lib/machines/layout/layoutContext';

export type Metric = {
  name: string;
  value: string;
};

export type SectionMetricData = {
  sectionGroups: Array<PlannedSectionDetails>;
  roi: string;
  metrics: Array<Metric>;
  file?: File;
  uploadInProgress?: UploadProgress;
  uploadResult?: UploadResult<any>;
};

export type XeniumMetricsForm = {
  workNumber: string;
  labware: LabwareFlaggedFieldsFragment | undefined;
  sectionsMetricData: Array<SectionMetricData>;
  runName: string;
  runNames: string[];
  error?: string;
};

const initialValues: XeniumMetricsForm = {
  labware: undefined,
  sectionsMetricData: [],
  workNumber: '',
  runNames: [],
  runName: '',
  error: undefined
};

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required(),
  labware: Yup.object().required(),
  sectionsMetricData: Yup.array()
    .of(
      Yup.object().shape({
        sectionGroups: Yup.array().min(1),
        roi: Yup.string().required(),
        metrics: Yup.array(),
        file: Yup.mixed().optional(),
        uploadInProgress: Yup.object().optional(),
        uploadResult: Yup.object().optional()
      })
    )
    .min(1)
    .test('at-least-one-metric', 'At least one metric must be uploaded', (value, context) => {
      return (
        value &&
        value.some((data) => {
          return data.metrics && data.metrics.length > 0;
        })
      );
    })
});

const XeniumMetrics = () => {
  const stanCore = useContext(StanCoreContext);

  const getRunNames = useCallback(
    async (
      barcode: string,
      setValues: (values: SetStateAction<XeniumMetricsForm>, shouldValidate?: boolean) => {}
    ): Promise<string[]> => {
      const response = await stanCore.GetRunNames({
        barcode: barcode
      });
      if (response.runNames) {
        setValues((prev) => ({
          ...prev,
          runNames: response.runNames
        }));
        return [];
      } else {
        return ['No run names found for the labware ' + barcode];
      }
    },
    [stanCore]
  );

  const getRois = useCallback(
    async (
      labware: LabwareFlaggedFieldsFragment,
      runName: string,
      setValues: (values: SetStateAction<XeniumMetricsForm>, shouldValidate?: boolean) => {}
    ) => {
      stanCore.GetRunRois({ barcode: labware.barcode, run: runName }).then((response) => {
        if (response.runRois && response.runRois.length > 0) {
          const groupedByRoi = mapRoisToSectionGroups(labware, response.runRois);
          setValues((prev) => ({
            ...prev,
            error: undefined,
            labware: labware,
            sectionsMetricData: Object.keys(groupedByRoi).map((roi) => {
              return {
                sectionGroups: groupedByRoi[roi].sectionGroup,
                roi,
                metrics: []
              };
            })
          }));
        } else {
          setValues((prev) => ({
            ...prev,
            sectionsMetricData: [],
            error: 'No regions of interest are recorded for the scanned labware and the selected run name.'
          }));
        }
      });
    },
    [stanCore]
  );

  const validateAndFetchRois = useCallback(
    async (
      labware: LabwareFlaggedFieldsFragment,
      workNumber: string,
      runName: string,
      setValues: (values: SetStateAction<XeniumMetricsForm>, shouldValidate?: boolean) => {}
    ) => {
      if (!workNumber && runName) {
        setValues((prev) => ({
          ...prev,
          sectionsMetricData: [],
          error: `Please select a work number before selecting a run name.`
        }));
        return;
      }
      if (!runName) {
        setValues((prev) => ({
          ...prev,
          sectionsMetricData: [],
          error: undefined
        }));
        return;
      }

      const response = await stanCore.FindIfOpExists({
        operationType: 'Xenium Analyser QC',
        barcode: labware.barcode,
        workNumber: workNumber,
        run: runName
      });
      if (response.opExists) {
        await getRois(labware, runName, setValues);
      } else {
        setValues((prev) => ({
          ...prev,
          sectionsMetricData: [],
          error: `Xenium Analyser QC operation has not been performed on labware ${labware.barcode} for work number ${workNumber} and run name ${runName}.`
        }));
        return;
      }
    },
    [stanCore, getRois]
  );

  const formMachine = React.useMemo(() => {
    return createFormMachine<SampleMetricsRequest, RecordMetricsMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordMetrics({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;

  const resetFormValues = (setValues: (values: SetStateAction<XeniumMetricsForm>, shouldValidate?: boolean) => {}) => {
    setValues((prev) => ({
      ...prev,
      labware: undefined,
      sectionsMetricData: [],
      workNumber: '',
      runName: ''
    }));
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium Metrics</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <Formik<XeniumMetricsForm>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              const request: SampleMetricsRequest = {
                operationType: 'Xenium metrics',
                workNumber: values.workNumber,
                runName: values.runName,
                barcode: values.labware!.barcode,
                metrics: values.sectionsMetricData.flatMap((data) =>
                  data.metrics.map((metric) => ({
                    roi: data.roi,
                    name: metric.name,
                    value: metric.value
                  }))
                )
              };
              send({ type: 'SUBMIT_FORM', values: request });
            }}
          >
            {({ values, setValues, setFieldValue, isValid }) => (
              <Form>
                <Heading level={2} className="space-y-4 mb-6">
                  Labware
                </Heading>
                <LabwareScanner
                  limit={1}
                  enableFlaggedLabwareCheck
                  labwareCheckFunction={(
                    labwares: LabwareFlaggedFieldsFragment[],
                    foundLabware: LabwareFlaggedFieldsFragment
                  ) => {
                    return getRunNames(foundLabware.barcode, setValues);
                  }}
                >
                  {({ labwares, removeLabware }) =>
                    labwares.map((labware, index) => (
                      <div className="space-y-4 py-4" key={index}>
                        <Heading level={3}>Metric Operation Details</Heading>
                        <div className="grid grid-cols-2 gap-x-6 mt-2 pt-4">
                          <WorkNumberSelect
                            label={'SGP Number'}
                            onWorkNumberChange={async (workNumber: string) => {
                              await setFieldValue('workNumber', workNumber);
                              await validateAndFetchRois(labware, workNumber, values.runName, setValues);
                            }}
                          />
                          <CustomReactSelect
                            label={'Run Name'}
                            handleChange={(val) => setFieldValue('runName', (val as OptionType).label)}
                            emptyOption={true}
                            dataTestId="runName"
                            options={values.runNames.map((runName) => {
                              return {
                                label: runName,
                                value: runName
                              };
                            })}
                            onChange={async (val) => {
                              const runName = (val as OptionType).label;
                              await setFieldValue('runName', runName);
                              await validateAndFetchRois(labware, values.workNumber, runName, setValues);
                            }}
                          />
                        </div>
                        <Panel key={labware.barcode}>
                          <div className="grid grid-cols-2 mb-4">
                            {FlaggedBarcodeLink(labware.barcode, labware.flagPriority)}
                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton
                                onClick={() => {
                                  resetFormValues(setValues);
                                  removeLabware(labware.barcode);
                                }}
                              />
                            </div>
                          </div>
                          {values.sectionsMetricData.length > 0 && (
                            <div className="my-4">
                              <RoiTable
                                data={values.sectionsMetricData}
                                actionColumn={{
                                  Header: 'File Metrics',
                                  Cell: ({ row }: { row: Row<SectionMetricData> }) => {
                                    return <MetricsReader rowIndex={row.index} />;
                                  }
                                }}
                              />
                            </div>
                          )}
                          {values.error && (
                            <div>
                              <Warning message={values.error}></Warning>
                            </div>
                          )}
                        </Panel>
                      </div>
                    ))
                  }
                </LabwareScanner>
                {values.labware && values.sectionsMetricData.length > 0 && (
                  <div className={'sm:flex pt-4 sm:flex-row justify-end'}>
                    <BlueButton type="submit" disabled={!isValid}>
                      Save
                    </BlueButton>
                  </div>
                )}
                <OperationCompleteModal
                  show={submissionResult !== undefined}
                  message={'Xenium Metrics recorded on labware ' + values.labware?.barcode}
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
      </AppShell.Main>
    </AppShell>
  );
};

export default XeniumMetrics;
