import React, { useContext, useEffect, useRef } from 'react';
import AppShell from '../components/AppShell';
import { CleanOutMutation, CleanOutRequest } from '../types/sdk';
import { useMachine } from '@xstate/react';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import MutedText from '../components/MutedText';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import PinkButton from '../components/buttons/PinkButton';
import createFormMachine from '../lib/machines/form/formMachine';
import { StanCoreContext } from '../lib/sdk';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { fromPromise } from 'xstate';
import Labware from '../components/labware/Labware';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareSamplesTable from '../components/CellSegmentation/LabwareSamplesTable';
import RemoveButton from '../components/buttons/RemoveButton';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

const CleanOut: React.FC = () => {
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<CleanOutRequest, CleanOutMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.CleanOut({ request: input.event.values });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const submitForm = async (values: CleanOutRequest) => send({ type: 'SUBMIT_FORM', values });
  const serverError = current.context.serverError;

  const warningRef = useRef<HTMLDivElement>(null);
  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const initialValues: CleanOutRequest = {
    barcode: '',
    workNumber: '',
    addresses: []
  };

  const validationSchema = Yup.object().shape({
    barcode: Yup.string().required('A labware must be scanned in'),
    workNumber: Yup.string().required('SGP Number is a required field'),
    addresses: Yup.array().of(Yup.string()).min(1, 'At least one slot must be selected')
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Clean Out Labware</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<CleanOutRequest>
            initialValues={initialValues}
            onSubmit={async (values) => {
              await submitForm(values);
            }}
            validationSchema={validationSchema}
            validateOnMount={true}
          >
            {({ values, isValid, setFieldValue }) => (
              <Form>
                <GrayBox>
                  <motion.div
                    variants={variants.fadeInParent}
                    initial={'hidden'}
                    animate={'visible'}
                    exit={'hidden'}
                    className="md:w-2/3"
                  >
                    {serverError && <Warning error={serverError} ref={warningRef} />}
                    <div className="mb-8">
                      <Heading level={3}>SGP Number</Heading>
                      <MutedText>Please select an SGP number to associate with this operation.</MutedText>
                      <div className="my-4 md:w-1/2">
                        <WorkNumberSelect name="workNumber" />
                      </div>
                    </div>
                    <Heading level={3}>Labware</Heading>
                    <MutedText> Please scan in the labware you wish to clean.</MutedText>
                    <LabwareScanner
                      enableFlaggedLabwareCheck
                      limit={1}
                      onAdd={async (labware) => {
                        await setFieldValue('barcode', labware.barcode);
                      }}
                    >
                      {({ labwares, removeLabware }) => {
                        if (labwares.length === 0) {
                          return <></>;
                        }
                        return (
                          <>
                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton
                                type="button"
                                data-testid={'remove'}
                                onClick={async () => {
                                  removeLabware(labwares[0].barcode);
                                  await setFieldValue('addresses', []);
                                  await setFieldValue('barcode', '');
                                }}
                              />
                            </div>
                            <LabwareSamplesTable labware={labwares[0]} showBarcode={false} />
                            <p className="pl-1 pt-4 text-gray-700 lg:text-xs italic'">
                              <p>For selection of multiple slots :</p>
                              <p>Hold 'Shift' key to select consecutive items</p>
                              <p>Hold 'Ctrl' (Cmd for Mac) key to select non-consecutive items</p>
                            </p>
                            <Labware
                              labware={labwares[0]}
                              selectable={'non_empty'}
                              selectionMode={'multi'}
                              onSelect={async (addresses) => {
                                await setFieldValue('addresses', addresses);
                              }}
                            />
                          </>
                        );
                      }}
                    </LabwareScanner>
                  </motion.div>
                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>
                    {values.workNumber ? (
                      <p data-testid={'summary-sgp'}>
                        The selected SGP number: <span className="font-semibold">{values.workNumber}</span>.
                      </p>
                    ) : (
                      <p className="text-sm italic">No SGP number selected.</p>
                    )}
                    {values.barcode ? (
                      <p data-testid={'summary-sgp'}>
                        The selected labware barcode: <span className="font-semibold">{values.barcode}</span>.
                      </p>
                    ) : (
                      <p className="text-sm italic">No labware scanned</p>
                    )}
                    {values.addresses.length > 0 ? (
                      <p>
                        <span className="font-semibold">{values.addresses.length}</span> slot(s) to be cleaned out.
                      </p>
                    ) : (
                      <p className="italic text-sm">No slot selected to be cleaned out.</p>
                    )}

                    <PinkButton disabled={!isValid} type="submit" className="sm:w-full">
                      Clean Out
                    </PinkButton>
                  </Sidebar>
                </GrayBox>
              </Form>
            )}
          </Formik>

          <OperationCompleteModal show={current.matches('submitted')} message={'Slot(s) are cleaned out successively'}>
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

export default CleanOut;
