import { InPlaceOpRequest, LabwareFlaggedFieldsFragment, RecordInPlaceMutation } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { Form, Formik } from 'formik';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import React from 'react';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import MutedText from '../components/MutedText';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import PinkButton from '../components/buttons/PinkButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { fromPromise } from 'xstate';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';

const validationSchema = Yup.object().shape({
  workNumbers: Yup.array().of(Yup.string().required()).min(1).required().label('Request Number'),
  labware: Yup.array().of(Yup.object().required()).min(1).required().label('Labware')
});

type ReassignLabwareFormValues = {
  workNumbers: string[];
  labware: LabwareFlaggedFieldsFragment[];
};

const initialValues: ReassignLabwareFormValues = {
  workNumbers: [],
  labware: []
};

export const ReassignRequestNumber = () => {
  const formSubmitMachine = React.useMemo(() => {
    return createFormMachine<InPlaceOpRequest, RecordInPlaceMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordInPlace({
            request: input.event.values
          });
        })
      }
    });
  }, []);
  const [currentForm, sendForm] = useMachine(formSubmitMachine);

  const { serverError, submissionResult } = currentForm.context;

  const convertValuesAndSubmit = (formValues: ReassignLabwareFormValues) => {
    sendForm({
      type: 'SUBMIT_FORM',
      values: {
        barcodes: formValues.labware.map((lw) => lw.barcode),
        workNumbers: formValues.workNumbers,
        operationType: 'assign to work'
      }
    });
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Re-assign Request Number</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<ReassignLabwareFormValues>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={convertValuesAndSubmit}
            validateOnMount={true}
          >
            {({ values, setFieldValue, isValid }) => (
              <Form>
                <GrayBox>
                  <div className="md:w-3/4">
                    <div>
                      {serverError && <Warning error={serverError} />}
                      <Heading level={3}>Request Number</Heading>
                      <MutedText>Please select an request number to associate with the scanned labware</MutedText>
                      <div className="mt-4 md:w-1/2">
                        <WorkNumberSelect
                          dataTestId="workNumbers"
                          workNumber={values.workNumbers}
                          onWorkNumberChangeInMulti={async (workNumbers) => {
                            await setFieldValue('workNumbers', [...workNumbers]);
                          }}
                          multiple
                          workNumberType="ALL"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <Heading level={3}>Labware</Heading>
                      <MutedText>Please scan in the labware you wish to re-assign.</MutedText>
                      <LabwareScanner
                        data-testid="labware-scanner"
                        onChange={async (labware) => {
                          await setFieldValue('labware', labware);
                        }}
                        enableFlaggedLabwareCheck
                      >
                        <LabwareScanPanel
                          columns={[
                            columns.barcode(),
                            columns.donorId(),
                            columns.labwareType(),
                            columns.externalName(),
                            columns.bioState()
                          ]}
                        />
                      </LabwareScanner>
                    </div>
                  </div>

                  <Sidebar data-testid={'summary'}>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {values.workNumbers && values.workNumbers.length > 0 ? (
                      <p data-testid="summary-text" className="text-sm">
                        The scanned labware will be re-assigned to the following request number(s):
                        <span className="font-bold"> {values.workNumbers.join(', ')}</span>
                      </p>
                    ) : (
                      <p className="text-sm italic">No request number selected.</p>
                    )}

                    <PinkButton
                      disabled={currentForm.matches('submitted') || !isValid}
                      loading={currentForm.matches('submitting')}
                      type="submit"
                      className="sm:w-full"
                      data-testid="submit"
                    >
                      Re-assign
                    </PinkButton>
                  </Sidebar>

                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message="All labware have been successfully re-assigned."
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                </GrayBox>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
