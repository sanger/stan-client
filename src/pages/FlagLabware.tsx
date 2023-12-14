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
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import DataTable from '../components/DataTable';
import { FormikErrorMessage } from '../components/forms';
import { LabwareFlagDetails } from '../components/labwareFlagDetails';
import { Column } from 'react-table';

type FormFlagLabware = {
  labware: LabwareFieldsFragment | undefined;
  description: string;
};

const initialValues: FormFlagLabware = { labware: undefined, description: '' };
function buildValidationSchema() {
  return Yup.object().shape({
    labware: Yup.object().label('Labware').required('Labware is required'),
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
    return createFormMachine<FlagLabwareRequest, FlagLabwareMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.FlagLabware({ request: e.values });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(() => formMachine);
  const validationSchema = useMemo(() => buildValidationSchema(), []);

  const convertValuesAndSubmit = async (values: FormFlagLabware) => {
    if (!values.labware) return;
    const requestValues: FlagLabwareRequest = {
      barcode: values.labware!.barcode,
      description: values.description
    };
    send({ type: 'SUBMIT_FORM', values: requestValues });
  };

  const serverError = current.context.serverError;

  const labwareColumns = useMemo(() => {
    return [
      columns.barcode(),
      columns.externalName(),
      columns.donorId(),
      columns.tissueType(),
      columns.labwareType()
    ] as Array<Column<LabwareFlaggedFieldsFragment>>;
  }, []);

  const [relatedFlags, setRelatedFlags] = React.useState<FlagDetail[]>([]);

  const checkRelatedFlags = useCallback(
    async (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): Promise<string[]> => {
      try {
        const response = await stanCore.GetLabwareFlagDetails({
          barcodes: [foundLabware.barcode]
        });
        setRelatedFlags(response.labwareFlagDetails);
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
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={convertValuesAndSubmit}>
            {({ values, setFieldValue }) => (
              <Form>
                <GrayBox>
                  <div className="md:w-3/4">
                    <div className="space-y-4">
                      {serverError && <Warning error={serverError} />}
                      <Heading level={3}>Labware</Heading>
                      <MutedText>Please scan in the labware you wish to flag.</MutedText>
                      <LabwareScanner
                        limit={1}
                        onAdd={(lw) => {
                          setFieldValue('labware', lw);
                        }}
                        enableFlaggedLabwareCheck={true}
                        labwareCheckFunction={checkRelatedFlags}
                      >
                        {({ labwares, removeLabware }) =>
                          labwares.map((labware, index) => (
                            <Panel key={labware.barcode}>
                              <div className="flex flex-row items-center justify-end">
                                {
                                  <RemoveButton
                                    data-testid={'remove'}
                                    onClick={() => {
                                      setFieldValue('labware', undefined);
                                      removeLabware(labware.barcode);
                                    }}
                                  />
                                }
                              </div>

                              <DataTable columns={labwareColumns} data={[labware]} />

                              {relatedFlags.length > 0 && <LabwareFlagDetails flagDetails={relatedFlags} />}

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
                            </Panel>
                          ))
                        }
                      </LabwareScanner>
                    </div>
                  </div>
                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {values.labware ? (
                      <p>
                        <span className="font-semibold">{values.labware.barcode}</span> will be flagged.
                      </p>
                    ) : (
                      <p className="italic text-sm">No labware scanned.</p>
                    )}

                    <PinkButton type="submit" className="sm:w-full" disabled={!values.labware}>
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
