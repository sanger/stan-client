import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SegmentationLabware,
  SegmentationMutation,
  SegmentationRequest
} from '../types/sdk';
import { createSessionStorageForLabwareAwaiting, formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import React, { useContext } from 'react';
import BlueButton from '../components/buttons/BlueButton';
import { useLoaderData, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import WhiteButton from '../components/buttons/WhiteButton';
import { SegmentationQc } from '../components/CellSegmentation/SegmentationQc';

type CellSegmentationQcProps = {
  labware: LabwareFlaggedFieldsFragment;
  workNumber: string;
  performed: string;
  comments?: string[];
};

export type CellSegmentationQcFormProps = {
  cellSegmentation: CellSegmentationQcProps[];
  workNumberAll: string;
  performedAll: string;
  commentsAll: string[];
};

const defaultFormValues: CellSegmentationQcFormProps = {
  cellSegmentation: [],
  workNumberAll: '',
  performedAll: getCurrentDateTime(),
  commentsAll: []
};

const validationSchema = Yup.object().shape({
  cellSegmentation: Yup.array().of(
    Yup.object().shape({
      workNumber: Yup.string().required('SGP number is required'),
      performed: Yup.string().required('Performed time is required'),
      comments: Yup.array().of(Yup.string()).optional()
    })
  )
});

const toSegmentationQcRequest = (values: CellSegmentationQcFormProps): SegmentationRequest => {
  const labware: Array<SegmentationLabware> = values.cellSegmentation.map((cellSeg) => {
    return {
      barcode: cellSeg.labware.barcode,
      workNumber: cellSeg.workNumber,
      performed: formatDateTimeForCore(cellSeg.performed),
      commentIds: cellSeg.comments ? cellSeg.comments.map((comment) => parseInt(comment)) : []
    };
  });
  return {
    operationType: 'Cell Segmentation QC',
    labware
  };
};

export const CellSegmentationQc = ({ initialFormValues = defaultFormValues }) => {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<SegmentationRequest, SegmentationMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.Segmentation({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);

  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  const navigate = useNavigate();
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Cell Segmentation QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik
              initialValues={initialFormValues}
              onSubmit={async (values) => {
                send({ type: 'SUBMIT_FORM', values: toSegmentationQcRequest(values) });
              }}
              validationSchema={validationSchema}
              validateOnMount={true}
            >
              {({ isValid, values }) => (
                <Form>
                  <SegmentationQc comments={comments} />
                  {values.cellSegmentation.length > 0 && (
                    <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                      <BlueButton type="submit" disabled={!isValid}>
                        Save
                      </BlueButton>
                    </div>
                  )}

                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Cell Segmentation QC recorded on all labware'}
                    additionalButtons={
                      <WhiteButton
                        type="button"
                        style={{ marginLeft: 'auto' }}
                        className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                        onClick={() => {
                          createSessionStorageForLabwareAwaiting(
                            values.cellSegmentation.map((cellSeg) => cellSeg.labware as LabwareFieldsFragment)
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
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
