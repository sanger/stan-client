import React from 'react';
import AppShell from '../components/AppShell';
import { EquipmentFieldsFragment, InPlaceOpRequest, LabwareFieldsFragment, RecordInPlaceMutation } from '../types/sdk';
import { Form, Formik } from 'formik';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { FormikErrorMessage, selectOptionValues } from '../components/forms';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import PinkButton from '../components/buttons/PinkButton';
import * as Yup from 'yup';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { stanCore } from '../lib/sdk';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { Column } from 'react-table';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { fromPromise } from 'xstate';
import { useLoaderData, useNavigate } from 'react-router-dom';
import WhiteButton from '../components/buttons/WhiteButton';
import { createSessionStorageForLabwareAwaiting } from '../types/stan';
import { extractLabwareFromFlagged } from '../lib/helpers/labwareHelper';

type RecordInPlaceProps = {
  /**
   * The title of the page
   */
  title: string;

  /**
   * The name of the operation that is being performed
   */
  operationType: string;

  /**
   * The columns to display on labware scan for this operation
   */
  columns: Column<LabwareFieldsFragment>[];

  /**
   * The description for operation
   */
  description?: string;

  /**
   * Display the store option for the labware after the successful completion of operation
   */
  displayStoreOption?: boolean;
};

type RecordInPlaceForm = Omit<InPlaceOpRequest, 'barcodes'> & { labware: LabwareFieldsFragment[] };

export default function RecordInPlace({
  title,
  operationType,
  columns,
  description,
  displayStoreOption
}: RecordInPlaceProps) {
  const navigate = useNavigate();

  // The equipment available for this operation
  const equipments = useLoaderData() as EquipmentFieldsFragment[];
  const formMachine = React.useMemo(() => {
    return createFormMachine<InPlaceOpRequest, RecordInPlaceMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordInPlace({ request: input.event.values });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  /**
   * Validation schema for the form
   */
  const validationSchema = Yup.object().shape({
    labware: Yup.array().of(Yup.object().required()).min(1).required().label('Labware'),
    equipmentId: Yup.number()
      .oneOf(equipments ? equipments.map((e) => e.id) : [])
      .optional()
      .label('Equipment'),
    operationType: Yup.string().required().label('Operation Type'),
    workNumber: Yup.string().required().label('SGP Number')
  });

  /**
   * Initial values of the form
   */
  const initialValues: RecordInPlaceForm = {
    operationType,
    labware: [],
    equipmentId: undefined,
    workNumber: ''
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<RecordInPlaceForm>
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              //Reformat data to type InPlaceOpRequest by replacing labware field with barcodes field
              const { labware, ...rest } = values;
              const submitValues: InPlaceOpRequest = { ...rest, barcodes: labware.map((l) => l.barcode) };
              send({ type: 'SUBMIT_FORM', values: submitValues });
            }}
          >
            {({ values, setFieldValue, errors }) => (
              <>
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

                        <WorkNumberSelect
                          onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
                        />
                        <FormikErrorMessage name={'workNumber'} />
                      </motion.div>

                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>Labware</Heading>

                        <LabwareScanner
                          onChange={(labwareFlagged) =>
                            setFieldValue('labware', extractLabwareFromFlagged(labwareFlagged))
                          }
                          locked={current.matches('submitted')}
                          enableFlaggedLabwareCheck
                        >
                          <LabwareScanPanel columns={columns} />
                        </LabwareScanner>
                        <FormikErrorMessage name={'labware'} />
                      </motion.div>

                      {equipments && equipments.length > 0 && (
                        <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                          <Heading level={3}>Equipment</Heading>

                          <CustomReactSelect
                            isDisabled={current.matches('submitted')}
                            label={'Equipment'}
                            name={'equipmentId'}
                            dataTestId={'equipment'}
                            emptyOption
                            handleChange={(val) => {
                              const value = (val as OptionType).value;
                              setFieldValue('equipmentId', value === '' ? undefined : parseInt(value, 10));
                            }}
                            options={selectOptionValues(equipments, 'name', 'id')}
                          />
                        </motion.div>
                      )}
                    </motion.div>

                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>

                      {values.workNumber ? (
                        <p>
                          The selected SGP number is <span className="font-semibold">{values.workNumber}</span>.
                        </p>
                      ) : (
                        <p className="text-sm italic">No SGP number selected.</p>
                      )}

                      {description && (
                        <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                          <p className="my-3 text-white-800 text-xs leading-normal">
                            Once <span className="font-bold text-white-800">all labware</span> have been scanned, click
                            <span className="font-bold text-white-800"> Submit</span> {description}
                          </p>
                        </div>
                      )}
                      <PinkButton
                        disabled={current.matches('submitted')}
                        loading={current.matches('submitting')}
                        type="submit"
                        className="sm:w-full"
                      >
                        Submit
                      </PinkButton>
                    </Sidebar>
                  </GrayBox>
                </Form>
                <OperationCompleteModal
                  show={current.matches('submitted')}
                  message={'Operation Complete'}
                  additionalButtons={
                    displayStoreOption && values.labware.length > 0 ? (
                      <WhiteButton
                        type="button"
                        style={{ marginLeft: 'auto' }}
                        className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                        onClick={() => {
                          createSessionStorageForLabwareAwaiting(values.labware);
                          navigate('/store');
                        }}
                      >
                        Store
                      </WhiteButton>
                    ) : (
                      <></>
                    )
                  }
                >
                  <p>
                    If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                    the Home screen.
                  </p>
                </OperationCompleteModal>
              </>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
