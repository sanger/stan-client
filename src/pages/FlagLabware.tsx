import AppShell from '../components/AppShell';
import { Field, Form, Formik } from 'formik';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import MutedText from '../components/MutedText';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import columns from '../components/dataTableColumns/labwareColumns';
import PinkButton from '../components/buttons/PinkButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import React, { useCallback, useContext, useMemo } from 'react';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  FlagDetail,
  FlagLabwareMutation,
  FlagLabwareRequest,
  FlagPriority,
  LabwareFlaggedFieldsFragment
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import DataTable from '../components/DataTable';
import { FormikErrorMessage } from '../components/forms';
import { LabwareFlagDetails } from '../components/LabwareFlagDetails';
import { Column } from 'react-table';
import { fromPromise } from 'xstate';
import WorkNumberSelect from '../components/WorkNumberSelect';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import StyledLink from '../components/StyledLink';

type FormFlagLabware = {
  labware: Array<LabwareFlaggedFieldsFragment>;
  description: string;
  workNumber: string;
  priority?: FlagPriority;
};

const initialValues: FormFlagLabware = { labware: [], description: '', workNumber: '' };

function buildValidationSchema() {
  return Yup.object().shape({
    workNumber: Yup.string().label('Work Number').optional(),
    labware: Yup.array().of(Yup.object()).label('Labware').min(1, 'Labware is required'),
    priority: Yup.string().required('Flag Priority is required').oneOf([FlagPriority.Note, FlagPriority.Flag]),
    description: Yup.string()
      .label('Description')
      .required('Description is required')
      .max(500, 'Please enter a description of no more than 500 characters')
      .min(5, 'Please enter a valid description')
  });
}

const FlagLabware = () => {
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<FlagLabwareRequest, FlagLabwareMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.FlagLabware({ request: input.event.values });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const validationSchema = useMemo(() => buildValidationSchema(), []);

  const convertValuesAndSubmit = async (values: FormFlagLabware) => {
    if (!values.labware) return;
    const requestValues: FlagLabwareRequest = {
      ...values,
      priority: values.priority!,
      barcodes: values.labware!.map((lw) => lw?.barcode)
    };
    send({ type: 'SUBMIT_FORM', values: requestValues });
  };

  const serverError = current.context.serverError;

  const labwareColumns = useMemo(() => {
    return [columns.externalName(), columns.donorId(), columns.tissueType(), columns.labwareType()] as Array<
      Column<LabwareFlaggedFieldsFragment>
    >;
  }, []);

  const [relatedFlags, setRelatedFlags] = React.useState<Map<string, Array<FlagDetail>>>(new Map()); //labware barcode for a key

  const checkRelatedFlags = useCallback(
    async (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): Promise<string[]> => {
      try {
        const response = await stanCore.GetLabwareFlagDetails({
          barcodes: [foundLabware.barcode]
        });
        if (response.labwareFlagDetails && response.labwareFlagDetails.length > 0) {
          setRelatedFlags((relatedFlags) => {
            return new Map(relatedFlags.set(foundLabware.barcode, response.labwareFlagDetails as Array<FlagDetail>));
          });
        }
        return [];
      } catch (error) {
        return ['Error fetching labware flag details.'];
      }
    },
    [stanCore]
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Flag Labware</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        {serverError && <Warning error={serverError} />}
        <div className="max-w-screen-xl mx-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={convertValuesAndSubmit}
            validateOnMount={true}
          >
            {({ values, setFieldValue, setValues, errors }) => (
              <Form>
                <GrayBox>
                  <div className="md:w-3/4">
                    <div className="space-y-4">
                      {serverError && <Warning error={serverError} />}
                      <Heading level={3}>SGP Number</Heading>
                      <MutedText>SGP number is optional for this operation.</MutedText>
                      <div className="mt-4 md:w-1/2">
                        <WorkNumberSelect
                          name="workNumber"
                          onWorkNumberChange={async (workNumber) => {
                            await setFieldValue('workNumber', workNumber);
                          }}
                        />
                      </div>
                      <Heading level={3}>Flag Priority</Heading>
                      <MutedText>Please select the flag priority to apply to the scanned labware.</MutedText>
                      <CustomReactSelect
                        dataTestId="priority"
                        className="mt-4 md:w-1/2"
                        name="priority"
                        emptyOption={true}
                        options={[
                          { value: FlagPriority.Note, label: 'Note' },
                          { value: FlagPriority.Flag, label: 'Flag' }
                        ]}
                      />
                      <Heading level={3}>Labware</Heading>
                      <MutedText>Please scan in the labware you wish to flag.</MutedText>
                      <LabwareScanner
                        onAdd={async (lw) =>
                          await setValues({
                            ...values,
                            labware: values.labware.concat(lw)
                          })
                        }
                        enableFlaggedLabwareCheck
                        labwareCheckFunction={checkRelatedFlags}
                      >
                        {({ labwares, removeLabware }) =>
                          labwares.map((labware) => (
                            <Panel key={labware.barcode}>
                              <div className="flex flex-row items-center justify-end">
                                <RemoveButton
                                  data-testid={'remove'}
                                  onClick={async () => {
                                    removeLabware(labware.barcode);
                                    await setValues({
                                      ...values,
                                      labware: values.labware.filter((lw) => lw.barcode !== labware.barcode)
                                    });
                                  }}
                                />
                              </div>
                              <div className="whitespace-nowrap">
                                <StyledLink
                                  className="text-sp bg-transparent hover:text-sp-700 active:text-sp-800"
                                  to={`/labware/${labware.barcode}`}
                                  target="_blank"
                                >
                                  {labware.barcode}
                                </StyledLink>
                              </div>
                              <DataTable columns={labwareColumns} data={[labware]} />
                              {relatedFlags.size > 0 && relatedFlags.get(labware.barcode) && (
                                <LabwareFlagDetails flagDetails={relatedFlags.get(labware.barcode)!} />
                              )}
                            </Panel>
                          ))
                        }
                      </LabwareScanner>
                      <div className="mt-6">
                        <Heading level={3}>Description</Heading>
                        <MutedText>Please enter a reason for flagging the labware.</MutedText>
                        <Field
                          as={'textarea'}
                          rows={5}
                          cols={77}
                          maxLength={500}
                          name="description"
                          data-testid="description"
                        />
                        <FormikErrorMessage name="description" />
                      </div>
                    </div>
                  </div>
                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>
                    {values.labware.length === 0 && <p className="italic text-sm">No labware scanned.</p>}
                    {values.labware.length > 0 && (
                      <p>
                        <span className="font-semibold">{values.labware.map((lw) => lw.barcode).join(', ')}</span> will
                        be flagged
                        {values.priority && (
                          <p>
                            with priority <span className="font-semibold capitalize"> {values.priority}</span>.
                          </p>
                        )}
                      </p>
                    )}
                    <PinkButton type="submit" className="sm:w-full" disabled={Object.keys(errors).length > 0}>
                      Flag Labware
                    </PinkButton>
                  </Sidebar>
                </GrayBox>
                <OperationCompleteModal show={current.matches('submitted')} message={'Labware Flagged'}>
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

export default FlagLabware;
