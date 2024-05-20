import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import React, { SetStateAction, useCallback, useContext } from 'react';
import { Form, Formik } from 'formik';
import {
  LabwareFlaggedFieldsFragment,
  RecordMetricsMutation,
  RoiFieldsFragment,
  SampleMetricsRequest
} from '../types/sdk';
import { StanCoreContext } from '../lib/sdk';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import { FlaggedBarcodeLink } from '../components/dataTableColumns/labwareColumns';
import StyledLink from '../components/StyledLink';
import DataTable from '../components/DataTable';
import { Row } from 'react-table';
import { UploadProgress, UploadResult } from '../components/upload/useUpload';
import MetricsReader from '../components/xeniumMetrics/MetricsReader';
import BlueButton from '../components/buttons/BlueButton';
import WorkNumberSelect from '../components/WorkNumberSelect';
import * as Yup from 'yup';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';

export type Metric = {
  name: string;
  value: string;
};

export type SampleMetricData = {
  sampleIdAddress: Array<{ sampleId: number; address: string }>;
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
};

const initialValues: XeniumMetricsForm = { labware: undefined, sampleMetricData: [], workNumber: '' };

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

export const groupByRoi = (rois: RoiFieldsFragment[]): Record<string, RoiFieldsFragment[]> => {
  const grouped = rois.reduce(
    (acc, data) => {
      if (!acc[data.roi]) {
        acc[data.roi] = [];
      }
      acc[data.roi].push(data);
      return acc;
    },
    {} as Record<string, RoiFieldsFragment[]>
  );
  return grouped;
};
const XeniumMetrics = () => {
  const stanCore = useContext(StanCoreContext);

  const getRegionsOfInterest = useCallback(
    async (
      foundLabware: LabwareFlaggedFieldsFragment,
      setValues: (values: SetStateAction<XeniumMetricsForm>, shouldValidate?: boolean) => {}
    ): Promise<string[]> => {
      try {
        const response = await stanCore.GetRegionsOfInterest({
          barcodes: [foundLabware.barcode]
        });
        if (response.rois.length > 0 && response.rois[0].rois) {
          const groupedByRoi = groupByRoi(response.rois[0]!.rois!);
          setValues((prev) => ({
            ...prev,
            labware: foundLabware,
            sampleMetricData: Object.keys(groupedByRoi).map((roi) => {
              return {
                sampleIdAddress: groupedByRoi[roi].map((data) => {
                  return { sampleId: data.sampleId, address: data.address };
                }),
                roi,
                metrics: []
              };
            })
          }));
          return [];
        }
        return ['No regions of interest recorded for the labware ' + foundLabware.barcode];
      } catch (error) {
        return ['Error fetching the regions of interests related to the labware ' + foundLabware.barcode];
      }
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
            validateOnMount={true}
          >
            {({ values, setValues, setFieldValue, isValid }) => (
              <Form>
                <div className="mt-8 space-y-2">
                  <div>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">Select an SGP number to associate with this operation.</p>
                    <div className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        onWorkNumberChange={(workNumber: string) => setFieldValue('workNumber', workNumber)}
                      />
                    </div>
                  </div>
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in a labware you wish to store metrics</p>
                  <LabwareScanner
                    limit={1}
                    enableFlaggedLabwareCheck
                    labwareCheckFunction={(
                      labwares: LabwareFlaggedFieldsFragment[],
                      foundLabware: LabwareFlaggedFieldsFragment
                    ) => {
                      return getRegionsOfInterest(foundLabware, setValues);
                    }}
                  >
                    {({ labwares, removeLabware }) =>
                      labwares.map((labware, index) => (
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
                                  removeLabware(labware.barcode);
                                }}
                              />
                            </div>
                          </div>
                          <div className="my-4">
                            <DataTable
                              columns={[
                                {
                                  Header: 'Region of interest',
                                  accessor: 'roi'
                                },
                                {
                                  Header: 'Sample ID',
                                  Cell: ({ row }: { row: Row<SampleMetricData> }) => {
                                    return (
                                      <div className="grid grid-cols-1 text-wrap">
                                        {row.original.sampleIdAddress.map((data, index) => {
                                          return (
                                            <label className="py-1" key={`${data.sampleId}-${index}`}>
                                              {data.sampleId}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                },
                                {
                                  Header: 'Address',
                                  Cell: ({ row }: { row: Row<SampleMetricData> }) => {
                                    return (
                                      <div className="grid grid-cols-1 text-wrap">
                                        {row.original.sampleIdAddress.map((data, index) => {
                                          return (
                                            <label className="py-1" key={`${data.address}-${index}`}>
                                              {data.address}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                },
                                {
                                  Header: 'File Metrics',
                                  Cell: ({ row }: { row: Row<SampleMetricData> }) => {
                                    return <MetricsReader rowIndex={row.index} />;
                                  }
                                }
                              ]}
                              data={values.sampleMetricData}
                            />
                          </div>
                        </Panel>
                      ))
                    }
                  </LabwareScanner>
                  <div className={'sm:flex pt-4 sm:flex-row justify-end'}>
                    <BlueButton type="submit" disabled={!isValid}>
                      Save
                    </BlueButton>
                  </div>
                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Xenium Metrics recorded on labware ' + values.labware?.barcode}
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default XeniumMetrics;
