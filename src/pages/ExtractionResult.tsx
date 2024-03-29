import React from 'react';
import AppShell from '../components/AppShell';
import {
  ExtractResultLabware,
  ExtractResultQuery,
  ExtractResultRequest,
  GetRecordExtractResultInfoQuery,
  LabwareFlaggedFieldsFragment,
  PassFail,
  RecordExtractResultMutation
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { reload, stanCore } from '../lib/sdk';
import { Form, Formik } from 'formik';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { FormikLabwareScanner } from '../components/labwareScanner/FormikLabwareScanner';
import * as Yup from 'yup';
import BlueButton from '../components/buttons/BlueButton';
import { Link, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { ExtractResultLabwareTable } from '../components/extractResultLabwareTable/ExtractResultLabwareTable';
import Warning from '../components/notifications/Warning';
import ButtonBar from '../components/ButtonBar';
import { fromPromise } from 'xstate';

export type ExtractResultLabwareForm = ExtractResultLabware & { lw: LabwareFlaggedFieldsFragment };

export type ExtractResultRequestForm = {
  workNumber: string;
  labware: ExtractResultLabwareForm[];
};

export default function ExtractionResult() {
  const extractionResultInfo = useLoaderData() as GetRecordExtractResultInfoQuery;
  // There will be initial labware if user has come from the Extraction page
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { labware?: Array<LabwareFlaggedFieldsFragment> };
  const initialLabware: Array<LabwareFlaggedFieldsFragment> = state === null ? [] : state.labware ?? [];
  const [labwareToAnalyse, setLabwareToAnalyse] = React.useState<ExtractResultQuery[]>([]);

  const initialValues: ExtractResultRequestForm = {
    workNumber: '',
    labware: initialLabware.map(buildExtractResultLabware)
  };

  const formMachine = React.useMemo(() => {
    return createFormMachine<ExtractResultRequest, RecordExtractResultMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordExtractResult({ request: input.event.values });
        })
      }
    });
  }, []);

  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  const validationSchema = Yup.object().shape({
    workNumber: Yup.string().required().label('SGP Number'),
    labware: Yup.array()
      .min(1)
      .label('Labware')
      .of(
        Yup.object().shape({
          lw: Yup.object().required(),
          barcode: Yup.string().required(),
          result: Yup.string().oneOf([PassFail.Pass, PassFail.Fail]).required(),
          concentration: Yup.string()
            .nullable()
            .when('result', (result, schema) => {
              const val = result[0] as unknown as string;
              return val === PassFail.Pass ? Yup.string().min(1).required().label('Concentration') : schema;
            }),

          commentId: Yup.number()
            .nullable()
            .when('result', (result, schema) => {
              const val = result[0] as unknown as string;
              return val === PassFail.Fail
                ? Yup.number()
                    .required()
                    .oneOf(extractionResultInfo.comments.map((c) => c.id))
                : schema;
            })
        })
      )
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Extraction Result</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<ExtractResultRequestForm>
            validationSchema={validationSchema}
            initialValues={initialValues}
            validateOnMount={true}
            onSubmit={async (values) => {
              setLabwareToAnalyse(
                values.labware.map((lw) => {
                  return {
                    extractResult: {
                      labware: lw.lw,
                      passFail: lw.result,
                      concentration: lw.concentration,
                      commentId: lw.commentId
                    }
                  };
                })
              );
              return send({
                type: 'SUBMIT_FORM',
                values: { ...values, labware: values.labware.map(({ lw, ...rest }) => rest) }
              });
            }}
          >
            {({ isValid, setFieldValue }) => (
              <Form className="space-y-8">
                <div>
                  <Heading level={3}>SGP Number</Heading>
                  <p className="mt-2">Select an SGP number to associate with this extraction result.</p>
                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      name="workNumber"
                      onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Heading level={3}>Labware</Heading>

                  <FormikLabwareScanner<ExtractResultLabwareForm>
                    initialLabwares={initialLabware}
                    buildLabware={buildExtractResultLabware}
                    enableFlaggedLabwareCheck
                  >
                    <ExtractResultLabwareTable availableComments={extractionResultInfo.comments} />
                  </FormikLabwareScanner>
                </div>

                {serverError && <Warning message={'Save Error'} error={serverError} />}

                <div className="space-y-4 flex flex-row items-center justify-end">
                  <BlueButton loading={current.matches('submitting')} disabled={!isValid} type="submit">
                    Submit
                  </BlueButton>
                </div>

                {current.matches('submitted') && (
                  <ButtonBar>
                    <BlueButton onClick={() => reload(navigate)} action="tertiary">
                      Reset Form
                    </BlueButton>
                    <Link to={'/'}>
                      <BlueButton action="primary">Return Home</BlueButton>
                    </Link>
                    <div className={''}>
                      <Link to={'/lab/rna_analysis'} state={labwareToAnalyse}>
                        <BlueButton action="primary">Go to RNA analysis &gt;</BlueButton>
                      </Link>
                    </div>
                  </ButtonBar>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

/**
 * Builds the default {@link ExtractResultLabware} for a labware
 * @param labware the labware to build a default for
 */
function buildExtractResultLabware(labware: LabwareFlaggedFieldsFragment): ExtractResultLabwareForm {
  return {
    lw: labware,
    barcode: labware.barcode,
    result: PassFail.Pass,
    concentration: '0.00',
    commentId: undefined
  };
}
