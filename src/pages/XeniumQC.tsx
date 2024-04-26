import React, { useContext } from 'react';
import { CommentFieldsFragment, QcLabware, QcLabwareRequest, RecordQcLabwareMutation } from '../types/sdk';
import * as Yup from 'yup';
import { StanCoreContext } from '../lib/sdk';
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
import { getCurrentDateTime } from '../types/stan';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { useLoaderData } from 'react-router-dom';
import { fromPromise } from 'xstate';

export type XeniumQCFormData = {
  workNumberAll: string;
  labware: Array<QcLabware>;
  completion: string;
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
  const initialValues: XeniumQCFormData = {
    workNumberAll: '',
    labware: [],
    completion: currentTime
  };

  const validationSchema = Yup.object().shape({
    workNumberAll: Yup.string().optional(),
    completion: Yup.date()
      .max(currentTime, 'Please select a date and time on or before current time')
      .required('Completion time is a required field')
      .label('Completion Time'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required(),
          workNumber: Yup.string().required().label('SGP Number'),
          comments: Yup.array().min(0).optional()
        })
      )
      .required()
      .min(1)
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <Formik<XeniumQCFormData>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              const request: QcLabwareRequest = {
                operationType: 'XENIUM QC',
                labware: values.labware.map((lw) => {
                  return {
                    ...lw,
                    completion: lw.completion!.replace('T', ' ') + ':00'
                  };
                })
              };
              send({ type: 'SUBMIT_FORM', values: request });
            }}
          >
            {({ values, setFieldValue, isValid }) => (
              <Form>
                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in any labware you wish to QC.</p>
                  <FieldArray name={'labware'}>
                    {({ push }) => (
                      <LabwareScanner
                        limit={2}
                        onAdd={(addedLw) => {
                          const index = values.labware.findIndex((lw) => lw.barcode === addedLw.barcode);
                          if (index < 0) {
                            push({
                              barcode: addedLw.barcode,
                              workNumber: values.workNumberAll,
                              completion: values.completion,
                              comments: []
                            });
                          }
                        }}
                        enableFlaggedLabwareCheck
                        checkForCleanedOutAddresses
                      >
                        {({ labwares, removeLabware, cleanedOutAddresses }) => (
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
                                    cleanedOutAddress={cleanedOutAddresses ? cleanedOutAddresses.get(lw.id) : undefined}
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
                  message={'Xenium QC recorded on all labware'}
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
