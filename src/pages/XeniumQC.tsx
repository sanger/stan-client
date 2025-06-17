import React, { SetStateAction, useCallback, useContext } from 'react';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  QcLabwareRequest,
  RecordQcLabwareMutation,
  RoiFieldsFragment,
  SampleFieldsFragment
} from '../types/sdk';
import * as Yup from 'yup';
import { stanCore, StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { FieldArray, Form, Formik } from 'formik';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { XeniumLabwareQC } from '../components/xeniumQC/XeniumLabwareQC';
import WorkNumberSelect from '../components/WorkNumberSelect';
import BlueButton from '../components/buttons/BlueButton';
import FormikInput from '../components/forms/Input';
import { createSessionStorageForLabwareAwaiting, getCurrentDateTime } from '../types/stan';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { fromPromise } from 'xstate';
import { groupByRoi } from '../components/xeniumMetrics/RoiTable';
import WhiteButton from '../components/buttons/WhiteButton';

export type SampleComment = {
  roi: string;
  sampleAddress: Array<{ sample: SampleFieldsFragment; address: string }>;
  comments: string[];
};

type QcFormLabware = {
  barcode: string;
  workNumber: string;
  completion: string;
  comments: string[];
  roiComments: string[];
  sampleComments: Array<SampleComment>;
  runNames?: string[];
  selectedRunName?: string;
  lw: LabwareFlaggedFieldsFragment;
};

export type XeniumQCFormData = {
  workNumberAll: string;
  labware: Array<QcFormLabware>;
  completion: string;
};

const getRegionsOfInterestGroupedByRoi = async (barcode: string): Promise<Record<string, RoiFieldsFragment[]>> => {
  const response = await stanCore.GetRegionsOfInterest({
    barcodes: [barcode]
  });
  if (response.rois.length === 0 || response.rois[0]!.rois.length === 0) return {};
  return groupByRoi(response.rois[0]!.rois!);
};

const getRunNames = async (barcode: string): Promise<string[]> => {
  return await stanCore
    .GetRunNames({
      barcode: barcode
    })
    .then((response) => response.runNames);
};

const XeniumQC = () => {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<QcLabwareRequest, RecordQcLabwareMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordQCLabware({
            // Stan-core's graphql schema describes the format of a timestamp as yyyy-mm-dd HH:MM:SS
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;

  const currentTime = getCurrentDateTime();

  const validationSchema = Yup.object().shape({
    workNumberAll: Yup.string().optional(),
    completion: Yup.date()
      .max(currentTime, 'Please select a date and time on or before current time')
      .required('Completion time is a required field')
      .label('Completion Time'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          lw: Yup.object(),
          barcode: Yup.string().required(),
          workNumber: Yup.string().required().label('SGP Number'),
          comments: Yup.array().min(0).optional(),
          runNames: Yup.array().min(0).optional(),
          selectedRunName: Yup.string().required('Run name is a required field'),
          roiComments: Yup.array().min(0).optional(),
          sampleComments: Yup.array()
            .of(
              Yup.object().shape({
                roi: Yup.string(),
                address: Yup.string(),
                sampleId: Yup.number(),
                comments: Yup.array().of(Yup.string()).optional()
              })
            )
            .optional()
        })
      )
      .required()
      .min(1)
  });

  const initialValues: XeniumQCFormData = {
    workNumberAll: '',
    labware: [],
    completion: currentTime
  };

  const getRelatedLabwareData = useCallback(
    async (
      labware: LabwareFlaggedFieldsFragment,
      setValues: (values: SetStateAction<XeniumQCFormData>, shouldValidate?: boolean) => {}
    ): Promise<string[]> => {
      try {
        const groupedByRoi = await getRegionsOfInterestGroupedByRoi(labware.barcode);
        if (Object.keys(groupedByRoi).length === 0)
          return [`No region of interest is recorded against the scanned labware ${labware.barcode}.`];
        const runNames = await getRunNames(labware.barcode);
        setValues((prev) => {
          prev.labware.push({
            lw: labware,
            barcode: labware.barcode,
            workNumber: prev.workNumberAll,
            completion: prev.completion,
            comments: [],
            roiComments: [],
            runNames,
            sampleComments: Object.keys(groupedByRoi).map((roi) => {
              return {
                sampleAddress: groupedByRoi[roi].map((data) => {
                  return { sample: data.sample ?? '', address: data.address };
                }),
                roi,
                comments: []
              };
            })
          });
          return prev;
        });

        return [];
      } catch (error) {
        return [`There was an error fetching the related data for the labware ${labware.barcode}.`];
      }
    },
    []
  );
  const navigate = useNavigate();
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium Analyser QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <Formik<XeniumQCFormData>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              const request: QcLabwareRequest = {
                operationType: 'XENIUM ANALYSER QC',
                labware: values.labware.map((lw) => {
                  return {
                    completion: lw.completion!.replace('T', ' ') + ':00',
                    barcode: lw.barcode,
                    workNumber: lw.workNumber,
                    comments: lw.comments.map((comment) => Number(comment)),
                    runName: lw.selectedRunName,
                    sampleComments: lw.sampleComments?.flatMap((sampleComment) => {
                      return sampleComment.sampleAddress.flatMap((sampleAdress) => {
                        return sampleComment.comments.map((commentId) => {
                          return {
                            sampleId: sampleAdress.sample.id,
                            address: sampleAdress.address,
                            commentId: Number(commentId)
                          };
                        });
                      });
                    })
                  };
                })
              };
              send({ type: 'SUBMIT_FORM', values: request });
            }}
          >
            {({ values, setFieldValue, isValid, setValues }) => (
              <Form>
                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in any labware you wish to QC.</p>
                  <FieldArray name={'labware'}>
                    {({ push }) => (
                      <LabwareScanner
                        onAdd={(addedLw) => {
                          const index = values.labware.findIndex((lw) => lw.barcode === addedLw.barcode);
                          if (index < 0) {
                            push({
                              barcode: addedLw.barcode,
                              workNumber: values.workNumberAll,
                              completion: values.completion,
                              comments: [],
                              lw: addedLw
                            });
                          }
                        }}
                        enableFlaggedLabwareCheck
                        labwareCheckFunction={(
                          labwares: LabwareFlaggedFieldsFragment[],
                          foundLabware: LabwareFlaggedFieldsFragment
                        ) => {
                          return getRelatedLabwareData(foundLabware, setValues);
                        }}
                      >
                        {({ labwares, removeLabware }) => (
                          <>
                            {labwares.length > 0 && (
                              <>
                                <div className={'flex flex-row w-full py-6 space-x-4'} data-testid={'xenium-qc-div'}>
                                  <div className={'w-1/2'}>
                                    <FormikInput
                                      label={'Completion Time'}
                                      data-testid={'completion'}
                                      type="datetime-local"
                                      name={'completion'}
                                      max={getCurrentDateTime()}
                                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setFieldValue('completion', e.target.value);
                                        labwares.forEach((lw, index) => {
                                          setFieldValue(`labware.${index}.completion`, e.target.value);
                                        });
                                      }}
                                      value={values.completion}
                                    />
                                  </div>
                                  <div className={'w-1/2'}>
                                    <WorkNumberSelect
                                      label={'SGP Number'}
                                      name={'workNumberAll'}
                                      dataTestId={'workNumberAll'}
                                      onWorkNumberChange={(workNumber) => {
                                        setFieldValue('workNumberAll', workNumber);
                                        labwares.forEach((lw, index) => {
                                          setFieldValue(`labware.${index}.workNumber`, workNumber);
                                        });
                                      }}
                                      workNumber={values.workNumberAll}
                                    />
                                  </div>
                                </div>

                                {labwares.map((lw, index) => (
                                  <XeniumLabwareQC
                                    key={lw.barcode}
                                    labware={lw}
                                    comments={comments}
                                    index={index}
                                    removeLabware={removeLabware}
                                  />
                                ))}
                                <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                                  <BlueButton type="submit" disabled={!isValid}>
                                    Save
                                  </BlueButton>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </LabwareScanner>
                    )}
                  </FieldArray>
                </div>
                <OperationCompleteModal
                  show={submissionResult !== undefined}
                  message={'Xenium Analyser QC recorded on all labware'}
                  additionalButtons={
                    <WhiteButton
                      type="button"
                      style={{ marginLeft: 'auto' }}
                      className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                      onClick={() => {
                        createSessionStorageForLabwareAwaiting(
                          values.labware.map((analyserLabware) => analyserLabware.lw as LabwareFieldsFragment)
                        );
                        navigate('/store');
                      }}
                    >
                      Store
                    </WhiteButton>
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
      </AppShell.Main>
    </AppShell>
  );
};
export default XeniumQC;
