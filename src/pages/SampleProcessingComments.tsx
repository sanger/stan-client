import React from 'react';

import AppShell from '../components/AppShell';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { stanCore } from '../lib/sdk';
import variants from '../lib/motionVariants';
import { motion } from '../dependencies/motion';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanTable from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTableColumns/labwareColumns';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import PinkButton from '../components/buttons/PinkButton';
import { Row } from 'react-table';
import MutedText from '../components/MutedText';

import { FormikErrorMessage, selectOptionValues } from '../components/forms';
import {
  CommentFieldsFragment,
  GetSampleProcessingCommentsInfoQuery,
  LabwareFieldsFragment,
  RecordSampleProcessingCommentsMutation,
  SampleProcessingCommentRequest
} from '../types/sdk';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { useLoaderData } from 'react-router-dom';
import { fromPromise } from 'xstate';

type SampleCommentsFormData = Required<SampleProcessingCommentRequest> & {
  /**Solution to apply to all labware**/
  applyAllComment: string;
};
const SampleProcessingComments: React.FC = () => {
  const sampleCommentsInfo = useLoaderData() as GetSampleProcessingCommentsInfoQuery;
  const formMachine = React.useMemo(() => {
    return createFormMachine<SampleProcessingCommentRequest, RecordSampleProcessingCommentsMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordSampleProcessingComments({
            request: {
              labware: input.event.values.labware
            }
          });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  const { serverError, submissionResult } = current.context;

  function buildValidationSchema(): Yup.AnyObjectSchema {
    return Yup.object().shape({
      labware: Yup.array()
        .of(
          Yup.object().shape({
            barcode: Yup.string().required('Barcode is a required field'),
            commentId: Yup.number().required('Comment is a required field')
          })
        )
        .required('At least one labware must be scanned')
        .min(1, 'At least one labware must be scanned'),
      applyAllComment: Yup.string().optional()
    });
  }

  const getCommentID = (comments: CommentFieldsFragment[], labwareComment: { barcode: string; commentId: number }) => {
    if (!labwareComment) return '';
    const comment = comments.find((comment) => comment.id === labwareComment.commentId);
    if (comment) {
      return comment.id + '';
    } else return '';
  };

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const commentsColumn = (values: SampleCommentsFormData) => {
    return {
      Header: 'Comments',
      id: 'comments',
      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
        return (
          <div>
            <CustomReactSelect
              name={`labware.${row.index}.commentId`}
              label={''}
              emptyOption
              valueAsNumber={true}
              options={selectOptionValues(sampleCommentsInfo.comments, 'text', 'id')}
              value={getCommentID(sampleCommentsInfo.comments, values.labware[row.index])}
            />
          </div>
        );
      }
    };
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sample Processing Comments</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className={'max-w-screen-xl mx-auto'}>
          {sampleCommentsInfo.comments && (
            <Formik<SampleCommentsFormData>
              initialValues={{
                labware: [],
                applyAllComment: ''
              }}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values
                });
              }}
              validationSchema={buildValidationSchema()}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <GrayBox>
                    <motion.div
                      variants={variants.fadeInParent}
                      initial={'hidden'}
                      animate={'visible'}
                      exit={'hidden'}
                      className="md:w-2/3 space-y-10"
                    >
                      {serverError && <Warning error={serverError} />}

                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>Labware</Heading>
                        <LabwareScanner
                          /***
                          Handlers to update the form data whenever labware list changes
                          ***/
                          onChange={(labware) => {
                            labware.forEach((lw, indx) => setFieldValue(`labware.${indx}.barcode`, lw.barcode));
                          }}
                          onAdd={() => {
                            setFieldValue(`labware.${values.labware.length}.commentId`, values.applyAllComment ?? -1);
                          }}
                          onRemove={(labware) => {
                            const updatedLabware = values.labware.filter((lw) => lw.barcode !== labware.barcode);
                            setFieldValue('labware', updatedLabware);
                          }}
                          enableFlaggedLabwareCheck
                        >
                          {values.labware.length === 0 && <FormikErrorMessage name={'labware'} />}
                          <motion.div variants={variants.fadeInWithLift}>
                            {values.labware.length > 0 && (
                              <motion.div variants={variants.fadeInWithLift} className={'pt-10 pb-5'}>
                                <CustomReactSelect
                                  name={'applyAllComment'}
                                  dataTestId={'applyAllComment'}
                                  label={'Comment'}
                                  emptyOption
                                  className={'w-1/2'}
                                  handleChange={(val) => {
                                    const value = (val as OptionType).label;
                                    setFieldValue('applyAllComment', value);
                                    values.labware.forEach((lw, indx) =>
                                      setFieldValue(`labware.${indx}.commentId`, Number((val as OptionType).value))
                                    );
                                  }}
                                  options={selectOptionValues(sampleCommentsInfo.comments, 'text', 'id')}
                                />
                                <MutedText>Comment selected will be applied to all labware</MutedText>{' '}
                              </motion.div>
                            )}
                            <LabwareScanTable
                              columns={[
                                labwareScanTableColumns.barcode(),
                                commentsColumn(values),
                                labwareScanTableColumns.donorId(),
                                labwareScanTableColumns.tissueType(),
                                labwareScanTableColumns.labwareType(),
                                labwareScanTableColumns.fixative()
                              ]}
                            />
                          </motion.div>
                        </LabwareScanner>
                      </motion.div>
                    </motion.div>
                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>
                      <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                        <p className="my-3 text-white-800 text-xs leading-normal">
                          Once <span className="font-bold text-white-800">all labware</span> have been scanned and{' '}
                          <span className="font-bold text-white-800">comments</span> selected for all, click
                          <span className="font-bold text-white-800"> Submit</span> to record comments.
                        </p>
                      </div>
                      <PinkButton type="submit" className="sm:w-full">
                        Submit
                      </PinkButton>
                    </Sidebar>

                    <OperationCompleteModal
                      show={submissionResult !== undefined}
                      message={'Labware generation comments recorded on all labware'}
                    >
                      <p>
                        If you wish to start the process again, click the "Reset Form" button. Otherwise you can return
                        to the Home screen.
                      </p>
                    </OperationCompleteModal>
                  </GrayBox>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SampleProcessingComments;
