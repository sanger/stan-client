import React, { useEffect } from 'react';
import labwareScanTableColumns from '../dataTableColumns/labwareColumns';
import PinkButton from '../buttons/PinkButton';
import { useMachine } from '@xstate/react';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import BlueButton from '../buttons/BlueButton';
import Heading from '../Heading';
import LayoutPlanner from '../LayoutPlanner';
import Labware from '../labware/Labware';
import { motion } from 'framer-motion';
import variants from '../../lib/motionVariants';
import Warning from '../notifications/Warning';
import { LabwareTypeName, NewLabwareLayout } from '../../types/stan';
import LabelPrinter, { PrintResult } from '../LabelPrinter';
import LabelPrinterButton from '../LabelPrinterButton';
import DataTable from '../DataTable';
import { CellProps } from 'react-table';
import {
  LabwareFieldsFragment,
  LabwareType,
  LabwareTypeFieldsFragment,
  PlanMutation,
  SlideCosting
} from '../../types/sdk';
import WhiteButton from '../buttons/WhiteButton';
import FormikInput from '../forms/Input';
import { usePrinters } from '../../lib/hooks';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { createLabwarePlanMachine } from './labwarePlan.machine';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../pages/sectioning';
import ScanInput from '../scanInput/ScanInput';
import FormikSelect from '../forms/Select';
import { objectKeys } from '../../lib/helpers';
import { FormikErrorMessage } from '../forms';

type LabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;

  /**
   * The labware to plan onto
   */
  outputLabware: NewLabwareLayout;

  sourceLabware: LabwareFieldsFragment[];

  operationType: string;

  sampleColors: Map<number, string>;
  /**
   * Callback triggered when the delete button is clicked
   * @param cid the client ID of the {@link LabwarePlan}
   */
  onDeleteButtonClick: (cid: string) => void;

  /**
   * Callback triggered once the plan has been successfully created
   * @param cid the client ID of the {@link LabwarePlan}
   * @param planResult the created plan
   */
  onComplete: (cid: string, planResult: PlanMutation) => void;
};

const LabwarePlan = React.forwardRef<HTMLDivElement, LabwarePlanProps>(
  ({ cid, outputLabware, onDeleteButtonClick, onComplete, sampleColors, operationType, sourceLabware }, ref) => {
    const labwarePlanMachine = React.useMemo(() => {
      return createLabwarePlanMachine(buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware));
    }, [sourceLabware, sampleColors, outputLabware]);
    const [current, send, service] = useMachine(labwarePlanMachine);

    useEffect(() => {
      const subscription = service.subscribe((state) => {
        if (state.context.plan && (state.matches('done') || state.matches('printing'))) {
          onComplete(cid, state.context.plan);
        }
      });

      return subscription.unsubscribe;
    }, [service, onComplete, cid]);

    const { handleOnPrint, handleOnPrintError, handleOnPrinterChange, printResult, currentPrinter } = usePrinters();

    const { requestError, layoutPlan, plan } = current.context;

    const plannedLabware = plan?.plan.labware ?? [];

    const { layoutMachine } = current.children;

    // Special case column that renders a label printer button for each row
    const printColumn = {
      id: 'printer',
      Header: '',
      Cell: (props: CellProps<LabwareFieldsFragment>) => (
        <LabelPrinterButton
          labwares={[props.row.original]}
          selectedPrinter={currentPrinter}
          onPrint={handleOnPrint}
          onPrintError={handleOnPrintError}
        />
      )
    };

    const columns = [labwareScanTableColumns.barcode(), printColumn];

    return (
      <motion.div
        ref={ref}
        variants={variants.fadeInWithLift}
        initial={'hidden'}
        animate={'visible'}
        className="relative p-3 shadow"
      >
        <Formik<FormValues>
          initialValues={buildInitialValues(operationType, outputLabware.labwareType)}
          validationSchema={buildValidationSchema(outputLabware.labwareType)}
          onSubmit={async (values) => {
            const newValues = {
              ...values,
              costing: values.costing === 'SGP' ? SlideCosting.Sgp : SlideCosting.Faculty
            };
            send({ type: 'CREATE_LABWARE', ...newValues });
          }}
        >
          {({ isValid, validateForm }) => (
            <Form>
              <div className="md:grid md:grid-cols-2">
                <div className="py-4 flex flex-col items-center justify-between space-y-8">
                  <Labware
                    labware={outputLabware}
                    onClick={() => send({ type: 'EDIT_LAYOUT' })}
                    name={outputLabware.labwareType.name}
                    slotText={(address) => buildSlotText(layoutPlan, address)}
                    slotSecondaryText={(address) => buildSlotSecondaryText(layoutPlan, address)}
                    slotColor={(address) => buildSlotColor(layoutPlan, address)}
                  />

                  {current.matches('prep') && (
                    <PinkButton
                      onClick={() => {
                        send({ type: 'EDIT_LAYOUT' });
                        validateForm();
                      }}
                    >
                      Edit Layout
                    </PinkButton>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow">
                  <div className="py-4 px-8 w-full space-y-6">
                    {current.matches('prep.errored') && (
                      <Warning message={'There was an error creating the Labware'} error={requestError} />
                    )}

                    <FormikInput label={''} type={'hidden'} name={'operationType'} value={operationType} />

                    {outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP && (
                      <FormikInput
                        name={'barcode'}
                        label={'Barcode'}
                        type={'text'}
                        disabled={current.matches('printing') || current.matches('done')}
                      />
                    )}

                    {outputLabware.labwareType.name !== LabwareTypeName.VISIUM_LP && (
                      <FormikInput
                        label={'Number of Labware'}
                        name={'quantity'}
                        type={'number'}
                        min={1}
                        step={1}
                        disabled={current.matches('printing') || current.matches('done')}
                      />
                    )}

                    {outputLabware.labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER && (
                      <FormikInput
                        disabled={current.matches('printing') || current.matches('done')}
                        label={'Section Thickness'}
                        name={'sectionThickness'}
                        type={'number'}
                        min={1}
                        step={1}
                      />
                    )}
                    {(outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP ||
                      outputLabware.labwareType.name === LabwareTypeName.VISIUM_TO ||
                      outputLabware.labwareType.name === LabwareTypeName.VISIUM_ADH) && (
                      <>
                        <ScanInput label={'Slide LOT number'} name={'lotNumber'} />
                        <FormikErrorMessage name={'lotNumber'} />
                        <FormikSelect label={'Slide costings'} name={'costing'} emptyOption={true}>
                          {objectKeys(SlideCosting).map((key) => (
                            <option key={key} value={SlideCosting[key]}>
                              {SlideCosting[key]}
                            </option>
                          ))}
                        </FormikSelect>
                      </>
                    )}
                  </div>

                  {plannedLabware.length > 0 && (
                    <div data-testid="plan-destination-labware" className="w-full space-y-4 py-4 px-8">
                      <DataTable columns={columns} data={plannedLabware} />
                      {printResult && <PrintResult result={printResult} />}
                    </div>
                  )}

                  {current.matches('printing') && (
                    <div className="w-full border-t-2 border-gray-200 py-3 px-4 space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
                      <LabelPrinter
                        labwares={plannedLabware}
                        showNotifications={false}
                        onPrinterChange={handleOnPrinterChange}
                        onPrint={handleOnPrint}
                        onPrintError={handleOnPrintError}
                      />
                    </div>
                  )}

                  {current.matches('prep') && (
                    <div className="w-full border-t-2 border-gray-200 py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
                      <WhiteButton onClick={() => onDeleteButtonClick(cid)}>Delete Layout</WhiteButton>
                      <BlueButton type="submit" disabled={current.matches({ prep: 'invalid' }) || !isValid}>
                        Create Labware
                      </BlueButton>
                    </div>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>

        <Modal show={current.matches('editingLayout')}>
          <ModalBody>
            <Heading level={3}>Set Layout</Heading>
            {layoutMachine && (
              <LayoutPlanner actor={layoutMachine}>
                <div className="my-2">
                  <p className="text-gray-900 text-sm leading-normal">
                    To add sections to a slot, select a source for the buttons on the right, and then click a
                    destination slot. Clicking a filled slot will empty it.
                  </p>
                </div>
              </LayoutPlanner>
            )}
          </ModalBody>
          <ModalFooter>
            <BlueButton
              onClick={() => layoutMachine.send({ type: 'DONE' })}
              className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </BlueButton>
            <WhiteButton
              onClick={() => layoutMachine.send({ type: 'CANCEL' })}
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </WhiteButton>
          </ModalFooter>
        </Modal>
      </motion.div>
    );
  }
);

export default LabwarePlan;

/**
 * Used as Formik's values
 */
type FormValues = {
  /**
   * The operation being planned for
   */
  operationType: string;

  /**
   * Only required for Visium LP slides
   */
  barcode?: string;

  /**
   * The number of this labware type that will be created
   */
  quantity: number;

  /**
   * The thickness of the sections being taken, in micrometres
   */
  sectionThickness?: number;

  /**
   * The Slide lot number (only for Visium slides)
   */
  lotNumber?: string;
  /**
   * The Slide costing (only for Visium slides)
   */
  costing?: string;
};

/**
 * The initial values for the labware plan form
 */
function buildInitialValues(operationType: string, labwareType: LabwareTypeFieldsFragment): FormValues {
  let formValues: FormValues = {
    operationType,
    quantity: 1
  };

  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    formValues.barcode = '';
  }
  if (labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER) {
    formValues.sectionThickness = 0;
  }
  if (
    labwareType.name === LabwareTypeName.VISIUM_LP ||
    labwareType.name === LabwareTypeName.VISIUM_TO ||
    labwareType.name === LabwareTypeName.VISIUM_ADH
  ) {
    formValues.costing = '';
    formValues.lotNumber = '';
  }

  return formValues;
}

/**
 * Builds a yup validator for the labware plan form
 * @param labwareType the labware type of the labware plan
 */
function buildValidationSchema(labwareType: LabwareType): Yup.AnyObjectSchema {
  type FormShape = {
    quantity: Yup.NumberSchema;
    sectionThickness?: Yup.NumberSchema;
    barcode?: Yup.StringSchema;
    lotNumber?: Yup.StringSchema;
    costing?: Yup.StringSchema;
  };

  let formShape: FormShape = {
    quantity: Yup.number().required().integer().min(1).max(99)
  };

  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    formShape.barcode = Yup.string().required().min(14);
  }
  if (labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER) {
    formShape.sectionThickness = Yup.number().required().integer().min(1);
  }
  if (
    labwareType.name === LabwareTypeName.VISIUM_LP ||
    labwareType.name === LabwareTypeName.VISIUM_TO ||
    labwareType.name === LabwareTypeName.VISIUM_ADH
  ) {
    formShape.lotNumber = Yup.string()
      .required()
      .matches(/^(\d{6}|\d{7})$/, 'Slide lot number should be a 6-7 digits number');
    formShape.costing = Yup.string().oneOf(Object.values(SlideCosting)).required('Slide costing is a required field');
  }
  return Yup.object().shape(formShape).defined();
}

/**
 * Builds the initial layout for this plan.
 */
function buildInitialLayoutPlan(
  sourceLabware: Array<LabwareFieldsFragment>,
  sampleColors: Map<number, string>,
  outputLabware: NewLabwareLayout
) {
  return {
    sources: sourceLabware.flatMap((lw) => {
      return lw.slots.flatMap((slot) => {
        return slot.samples.flatMap((sample) => {
          return {
            sampleId: sample.id,
            labware: lw,
            newSection: 0,
            address: slot.address
          };
        });
      });
    }),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: new Map()
  };
}
