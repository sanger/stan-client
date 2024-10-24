import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import React, { SetStateAction, useCallback, useContext } from 'react';
import { Form, Formik } from 'formik';
import { LabwareFlaggedFieldsFragment, RecordMetricsMutation, SampleMetricsRequest } from '../types/sdk';
import { StanCoreContext } from '../lib/sdk';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import { FlaggedBarcodeLink } from '../components/dataTableColumns/labwareColumns';
import StyledLink from '../components/StyledLink';
import { Row } from 'react-table';
import { UploadProgress, UploadResult } from '../components/upload/useUpload';
import MetricsReader from '../components/xeniumMetrics/MetricsReader';
import BlueButton from '../components/buttons/BlueButton';
import * as Yup from 'yup';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import RoiTable, { groupByRoi } from '../components/xeniumMetrics/RoiTable';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import WorkNumberSelect from '../components/WorkNumberSelect';

export type Metric = {
  name: string;
  value: string;
};

export type SampleMetricData = {
  externalIdAddress: Array<{ externalId: string; address: string }>;
  roi: string;
  metrics: Array<Metric>;
  file?: File;
  uploadInProgress?: UploadProgress;
  uploadResult?: UploadResult<any>;
};

export type XeniumMetricsForm = {
  workNumber: string;
  labware: LabwareFlaggedFieldsFragment | undefined;
  sampleMetricData: Array<SampleMetricData>;
  runName: string;
  runNames: string[];
};

const initialValues: XeniumMetricsForm = {
  labware: undefined,
  sampleMetricData: [],
  workNumber: '',
  runNames: [],
  runName: ''
};

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required(),
  labware: Yup.object().required(),
  sampleMetricData: Yup.array()
    .of(
      Yup.object().shape({
        sampleIdAddress: Yup.array()
          .of(Yup.object().shape({ sampleId: Yup.number(), address: Yup.string() }))
          .min(1),
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
        if (response.runRois) {
          const groupedByRoi = groupByRoi(response.runRois);
          setValues((prev) => ({
            ...prev,
            labware: labware,
            sampleMetricData: Object.keys(groupedByRoi).map((roi) => {
              return {
                externalIdAddress: groupedByRoi[roi].map((data) => {
                  return { externalId: data.sample.tissue.externalName ?? '', address: data.address };
                }),
                roi,
                metrics: []
              };
            })
          }));
        }
      });
    },
    [stanCore]
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
      sampleMetricData: [],
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
                metrics: values.sampleMetricData.flatMap((data) =>
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
                            onWorkNumberChange={(workNumber: string) => setFieldValue('workNumber', workNumber)}
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
                              await getRois(labware, runName, setValues);
                            }}
                          />
                        </div>
                        <Panel key={labware.barcode}>
                          <div className="grid grid-cols-2 mb-4">
                            {labware.flagged && FlaggedBarcodeLink(labware.barcode)}
                            {!labware.flagged && (
                              <StyledLink to={`/labware/${labware.barcode}`} target="_blank">
                                {labware.barcode}
                              </StyledLink>
                            )}

                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton
                                onClick={() => {
                                  resetFormValues(setValues);
                                  removeLabware(labware.barcode);
                                }}
                              />
                            </div>
                          </div>
                          {values.sampleMetricData.length > 0 && (
                            <div className="my-4">
                              <RoiTable
                                data={values.sampleMetricData.map((data) => {
                                  return {
                                    roi: data.roi,
                                    externalIdAddress: data.externalIdAddress
                                  };
                                })}
                                actionColumn={{
                                  Header: 'File Metrics',
                                  Cell: ({ row }: { row: Row<SampleMetricData> }) => {
                                    return <MetricsReader rowIndex={row.index} />;
                                  }
                                }}
                              />
                            </div>
                          )}
                          {values.runName && values.sampleMetricData.length === 0 && (
                            <div>
                              <Warning message="No regions of interest are recorded for the scanned labware and the selected run name."></Warning>
                            </div>
                          )}
                        </Panel>
                      </div>
                    ))
                  }
                </LabwareScanner>
                {values.labware && values.sampleMetricData.length > 0 && (
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
