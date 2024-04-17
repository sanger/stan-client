import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import {
  CommentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SegmentationLabware,
  SegmentationMutation,
  SegmentationRequest,
  SlideCosting
} from '../types/sdk';
import { formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import React, { useContext } from 'react';
import BlueButton from '../components/buttons/BlueButton';
import { useLoaderData } from 'react-router-dom';
import * as Yup from 'yup';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import Warning from '../components/notifications/Warning';
import { Segmentation } from '../components/CellSegmentation/CellSegmentation';

type CellSegmentationProps = {
  labware: LabwareFlaggedFieldsFragment;
  workNumber: string;
  performed: string;
  costing: string;
  comments: string[];
};

export type CellSegmentationFormProps = {
  cellSegmentation: CellSegmentationProps[];
  workNumberAll: string;
  performedAll: string;
  costingAll: string;
  commentsAll: string[];
};

const defaultFormValues: CellSegmentationFormProps = {
  cellSegmentation: [],
  workNumberAll: '',
  performedAll: getCurrentDateTime(),
  costingAll: '',
  commentsAll: []
};

const validationSchema = Yup.object().shape({
  cellSegmentation: Yup.array().of(
    Yup.object().shape({
      workNumber: Yup.string().required('SGP number is required'),
      performed: Yup.string().required('Performed time is required'),
      costing: Yup.string().oneOf(Object.keys(SlideCosting)).required('Costing is required'),
      comments: Yup.array().of(Yup.string()).min(1, 'Comment is required')
    })
  )
});

const toSegmentationRequest = (values: CellSegmentationFormProps): SegmentationRequest => {
  const labware: Array<SegmentationLabware> = values.cellSegmentation.map((cellSeg) => {
    return {
      barcode: cellSeg.labware.barcode,
      workNumber: cellSeg.workNumber,
      performed: formatDateTimeForCore(cellSeg.performed),
      costing: SlideCosting[cellSeg.costing as keyof typeof SlideCosting],
      commentIds: cellSeg.comments.map((comment) => parseInt(comment))
    };
  });
  return {
    operationType: 'Cell segmentation',
    labware
  };
};

export const CellSegmentation = ({ initialFormValues = defaultFormValues }) => {
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
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Cell Segmentation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik
              initialValues={initialFormValues}
              onSubmit={async (values) => {
                send({ type: 'SUBMIT_FORM', values: toSegmentationRequest(values) });
              }}
              validationSchema={validationSchema}
              validateOnMount={true}
            >
              {({ isValid }) => (
                <Form>
                  <Segmentation comments={comments} isQc={false} />
                  <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                    <BlueButton type="submit" disabled={!isValid}>
                      Save
                    </BlueButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <OperationCompleteModal
            show={submissionResult !== undefined}
            message={'Cell Segmentation recorded on all labware'}
          >
            <p>
              If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
              Home screen.
            </p>
          </OperationCompleteModal>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
