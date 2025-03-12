import React from 'react';
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanTable from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTableColumns/labwareColumns';
import PasteRestrictedBox from '../components/PasteRestrictedBox';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage } from '../components/forms';
import PinkButton from '../components/buttons/PinkButton';
import Warning from '../components/notifications/Warning';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { stanCore } from '../lib/sdk';
import { AddExternalIdMutation, AddExternalIdRequest } from '../types/sdk';
import { fromPromise } from 'xstate';

export default function AddExternalID() {
  type AddExternalIDFormData = Required<AddExternalIdRequest>;

  const formMachine = React.useMemo(() => {
    return createFormMachine<AddExternalIdRequest, AddExternalIdMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.AddExternalID({ request: input.event.values });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  function buildValidationSchema(): Yup.AnyObjectSchema {
    return Yup.object().shape({
      labwareBarcode: Yup.string().required('A labware must be scanned in'),
      externalName: Yup.string().required('External Identifier is a required field').min(1)
    });
  }

  const serverError = current.context.serverError;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Add External ID</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<AddExternalIDFormData>
            initialValues={{
              externalName: '',
              labwareBarcode: ''
            }}
            onSubmit={async (values) => {
              send({
                type: 'SUBMIT_FORM',
                values
              });
            }}
            validationSchema={buildValidationSchema()}
          >
            {({ setFieldValue }) => (
              <Form>
                <GrayBox>
                  <motion.div
                    variants={variants.fadeInParent}
                    initial={'hidden'}
                    animate={'visible'}
                    exit={'hidden'}
                    className="md:w-2/3 space-y-5"
                  >
                    {serverError && <Warning error={serverError} />}
                    <Heading level={3}>Labware</Heading>
                    <LabwareScanner
                      limit={1}
                      onAdd={(labware) => {
                        setFieldValue('labwareBarcode', labware.barcode);
                      }}
                      onRemove={() => {
                        setFieldValue('labwareBarcode', '');
                      }}
                      enableFlaggedLabwareCheck
                    >
                      <motion.div variants={variants.fadeInWithLift}>
                        <LabwareScanTable
                          columns={[
                            labwareScanTableColumns.barcode(),
                            labwareScanTableColumns.donorId(),
                            labwareScanTableColumns.tissueType(),
                            labwareScanTableColumns.spatialLocation(),
                            labwareScanTableColumns.replicate(),
                            labwareScanTableColumns.labwareType(),
                            labwareScanTableColumns.fixative(),
                            labwareScanTableColumns.medium()
                          ]}
                        />
                      </motion.div>
                      <FormikErrorMessage name={'labwareBarcode'} />
                    </LabwareScanner>
                    <Heading level={3}>External ID</Heading>
                    <motion.div>
                      <PasteRestrictedBox
                        onChange={(externalName) => {
                          setFieldValue('externalName', externalName);
                        }}
                      />
                      <FormikErrorMessage name={'externalName'} />
                    </motion.div>
                  </motion.div>

                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>
                    <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                      <p className="my-3 text-white-800 text-xs leading-normal">
                        Once <span className="font-bold text-white-800">a labware</span> has been scanned in and{' '}
                        <span className="font-bold text-white-800">a valid external id</span> is given, click
                        <span className="font-bold text-white-800"> Submit</span> to record the external id on the
                        sample.
                      </p>
                    </div>
                    <PinkButton type="submit" className="sm:w-full">
                      Submit
                    </PinkButton>
                  </Sidebar>

                  <OperationCompleteModal show={current.matches('submitted')} message={'Operation Complete'}>
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
}
