import React from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { FormikErrorMessage } from '../components/forms';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import PinkButton from '../components/buttons/PinkButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { LabwareFlaggedFieldsFragment, OrientationRequest, RecordOrientationQcMutation } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import columns from '../components/dataTableColumns/labwareColumns';
import * as Yup from 'yup';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import { objectKeys } from '../lib/helpers';
import { hasBlock } from '../lib/helpers/labwareHelper';
import { fromPromise } from 'xstate';

export enum OrientationType {
  Correct = 'Correct',
  Incorrect = 'Incorrect'
}
const validationSchema = Yup.object().shape({
  barcode: Yup.string().required(),
  workNumber: Yup.string().required('SGP Number is a required field'),
  orientation: Yup.string().required('Orientation is a required field')
});
type OrientationQCForm = {
  barcode: string;
  workNumber: string;
  orientation: OrientationType | undefined;
};
const OrientationQC = () => {
  const formMachine = React.useMemo(() => {
    return createFormMachine<OrientationRequest, RecordOrientationQcMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordOrientationQC({ request: input.event.values });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  const blockLabwareCheck = (labware: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment) => {
    return hasBlock(foundLabware) ? [] : ['Labware ' + foundLabware.barcode + ' is not a block labware.'];
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{'Orientation QC'}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<OrientationQCForm>
            initialValues={{
              barcode: '',
              workNumber: '',
              orientation: undefined
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              send({
                type: 'SUBMIT_FORM',
                values: {
                  workNumber: values.workNumber,
                  barcode: values.barcode,
                  correct: values.orientation === OrientationType.Correct
                }
              });
            }}
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
                      <Heading level={3}>SGP Number</Heading>
                      <WorkNumberSelect onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)} />
                      <FormikErrorMessage name={'workNumber'} />
                    </motion.div>

                    <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                      <Heading level={3}>Labware</Heading>
                      <LabwareScanner
                        onChange={async (labwares) => {
                          if (labwares.length > 0) {
                            await setFieldValue('barcode', labwares[0].barcode);
                          }
                        }}
                        locked={current.matches('submitted')}
                        labwareCheckFunction={blockLabwareCheck}
                        limit={1}
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
                      <FormikErrorMessage name={'barcodes'} />
                    </motion.div>
                    {values.barcode && (
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>Embedding Orientation</Heading>

                        <CustomReactSelect
                          label={'Orientation type'}
                          name={'orientation'}
                          dataTestId={'orientation'}
                          emptyOption
                          handleChange={(val) => {
                            const value = (val as OptionType).value;
                            setFieldValue('orientation', value);
                          }}
                          options={objectKeys(OrientationType).map((key) => {
                            return {
                              label: OrientationType[key],
                              value: OrientationType[key]
                            };
                          })}
                          value={values.orientation}
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {values.workNumber ? (
                      <p data-testid={'summary-sgp'}>
                        The selected SGP number is <span className="font-semibold">{values.workNumber}</span>.
                      </p>
                    ) : (
                      <p className="text-sm italic">No SGP number selected.</p>
                    )}
                    {values.barcode ? (
                      <p data-testid={'summary-barcode'}>
                        The selected labware is <span className="font-semibold">{values.barcode}</span>.
                      </p>
                    ) : (
                      <p className="text-sm italic">No labware scanned.</p>
                    )}
                    {values.orientation && (
                      <p data-testid={'summary-orientation'}>
                        The embedding orientation is <span className="font-semibold">{values.orientation}</span>.
                      </p>
                    )}

                    {
                      <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                        <p className="my-3 text-white-800 text-xs leading-normal">
                          Once <span className="font-bold text-white-800">labware, workNumber and orientation</span>{' '}
                          have been selected, click
                          <span className="font-bold text-white-800"> Submit</span> to record the orientation QC.
                        </p>
                      </div>
                    }
                    <PinkButton
                      disabled={!(values.workNumber && values.barcode && values.orientation)}
                      loading={current.matches('submitting')}
                      type="submit"
                      className="sm:w-full"
                    >
                      Submit
                    </PinkButton>
                  </Sidebar>
                </GrayBox>
              </Form>
            )}
          </Formik>

          <OperationCompleteModal
            show={current.matches('submitted')}
            message={'Orientation QC submitted successfully.'}
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
export default OrientationQC;
