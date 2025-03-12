import React, { useEffect, useState } from 'react';
import labwareScanTableColumns from '../dataTableColumns/labwareColumns';
import PinkButton from '../buttons/PinkButton';
import { useMachine } from '@xstate/react';
import Modal, { ModalBody, ModalFooter } from '../Modal';
import BlueButton from '../buttons/BlueButton';
import Heading from '../Heading';
import LayoutPlanner from '../LayoutPlanner';
import Labware from '../labware/Labware';
import { motion } from '../../dependencies/motion';
import variants from '../../lib/motionVariants';
import Warning from '../notifications/Warning';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../types/stan';
import LabelPrinter, { PrintResult } from '../LabelPrinter';
import LabelPrinterButton from '../LabelPrinterButton';
import DataTable from '../DataTable';
import { CellProps } from 'react-table';
import {
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareType,
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
import { objectKeys, Position } from '../../lib/helpers';
import { FormikErrorMessage } from '../forms';

type LabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;

  /**
   * The labware to plan onto
   */
  outputLabware: NewFlaggedLabwareLayout;

  sourceLabware: LabwareFlaggedFieldsFragment[];

  operationType: string;

  sampleColors: Map<number, string>;

  /** Specified section thickness when setting the plan */
  sectionThickness: number;
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
  (
    {
      cid,
      outputLabware,
      onDeleteButtonClick,
      onComplete,
      sampleColors,
      operationType,
      sourceLabware,
      sectionThickness
    },
    ref
  ) => {
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

    const { layoutMachine } = current.context;

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

    const [highlightedSlots, setHighlightedSlots] = useState(new Set<string>());

    const isLabwareWithCosting =
      outputLabware.labwareType.name === LabwareTypeName.VISIUM_TO ||
      outputLabware.labwareType.name === LabwareTypeName.VISIUM_ADH ||
      outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP ||
      outputLabware.labwareType.name === LabwareTypeName.XENIUM;
    return (
      <motion.div
        ref={ref}
        variants={variants.fadeInWithLift}
        initial={'hidden'}
        animate={'visible'}
        className="relative p-3 shadow-md"
      >
        <Formik<FormValues>
          initialValues={buildInitialValues(operationType, outputLabware, sectionThickness)}
          validationSchema={buildValidationSchema(outputLabware.labwareType)}
          onSubmit={async (values) => {
            const newValues = {
              ...values,
              costing: isLabwareWithCosting
                ? values.costing === 'SGP'
                  ? SlideCosting.Sgp
                  : SlideCosting.Faculty
                : undefined
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
                    barcodeInfoPosition={Position.TopRight}
                    highlightedSlots={highlightedSlots}
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
                <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow-md">
                  <div className="py-4 px-8 w-full space-y-6">
                    {current.matches('prep.errored') && (
                      <Warning message={'There was an error creating the Labware'} error={requestError} />
                    )}

                    <FormikInput label={''} type={'hidden'} name={'operationType'} value={operationType} />

                    {(outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP ||
                      outputLabware.labwareType.name === LabwareTypeName.XENIUM) && (
                      <FormikInput
                        name={'barcode'}
                        label={'Barcode'}
                        type={'text'}
                        disabled={current.matches('printing') || current.matches('done')}
                      />
                    )}

                    {(outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP ||
                      outputLabware.labwareType.name === LabwareTypeName.VISIUM_TO ||
                      outputLabware.labwareType.name === LabwareTypeName.VISIUM_ADH ||
                      outputLabware.labwareType.name === LabwareTypeName.XENIUM) && (
                      <>
                        <ScanInput
                          label={'Slide LOT number'}
                          name={'lotNumber'}
                          disabled={current.matches('printing') || current.matches('done')}
                        />
                        <FormikErrorMessage name={'lotNumber'} />
                        <FormikSelect
                          data-testid={'slide-costing'}
                          label={'Slide costings'}
                          name={'costing'}
                          emptyOption={true}
                          disabled={current.matches('printing') || current.matches('done')}
                        >
                          {objectKeys(SlideCosting).map((key) => (
                            <option key={key} value={SlideCosting[key]}>
                              {SlideCosting[key]}
                            </option>
                          ))}
                        </FormikSelect>
                      </>
                    )}

                    {outputLabware.labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER && (
                      <div className="p-4 space-y-2 space-x-2 bg-gray-100">
                        <div className={'grid grid-cols-2 py-2 text-gray-500 text-center'}>
                          <div>Section Thickness</div>
                        </div>
                        <div className={'flex flex-col space-y-4'}>
                          {outputLabware.slots.map((slot) => (
                            <div key={slot.address} className="flex flex-row items-start justify-start gap-x-2">
                              <span className="font-medium text-gray-800 tracking-wide py-2">{slot.address}</span>
                              <FormikInput
                                className="text-center focus:ring-sdb-100 focus:border-sdb-100 block border-gray-300 rounded-md disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-300"
                                label={''}
                                disabled={
                                  current.matches('printing') ||
                                  current.matches('done') ||
                                  !current.context.layoutPlan.plannedActions.has(slot.address)
                                }
                                name={
                                  current.context.layoutPlan.plannedActions.has(slot.address)
                                    ? `sectionThickness[${slot.address}]`
                                    : 'sectionThickness'
                                }
                                data-testid={`section-thickness`}
                                type="number"
                                min={0.5}
                                step={0.5}
                                onFocus={() => {
                                  setHighlightedSlots(new Set([slot.address]));
                                }}
                                onBlur={() => {
                                  setHighlightedSlots(new Set());
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
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
          {layoutMachine && (
            <ModalFooter>
              <BlueButton
                onClick={() => {
                  layoutMachine.send({ type: 'DONE' });
                }}
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
          )}
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
   * The thickness of the sections being taken, in micrometres
   */
  sectionThickness?: { [slotAddress: string]: number };

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
function buildInitialValues(
  operationType: string,
  labwareLayout: NewFlaggedLabwareLayout,
  sectionThickness: number
): FormValues {
  let formValues: FormValues = {
    operationType
  };
  const labwareType = labwareLayout.labwareType;
  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    formValues.barcode = '';
  }
  if (
    labwareType.name === LabwareTypeName.VISIUM_LP ||
    labwareType.name === LabwareTypeName.VISIUM_TO ||
    labwareType.name === LabwareTypeName.VISIUM_ADH
  ) {
    formValues.costing = undefined;
    formValues.lotNumber = '';
  }
  formValues.sectionThickness = {};
  labwareLayout.slots.forEach((slot) => {
    formValues.sectionThickness![slot.address] = sectionThickness;
  });
  return formValues;
}

/**
 * Builds a yup validator for the labware plan form
 * @param labwareType the labware type of the labware plan
 */
function buildValidationSchema(labwareType: LabwareType): Yup.AnyObjectSchema {
  type FormShape = {
    sectionThickness?: Yup.ObjectSchema<any>;
    barcode?: Yup.StringSchema;
    lotNumber?: Yup.StringSchema;
    costing?: Yup.StringSchema;
  };

  let formShape: FormShape = {};
  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    formShape.barcode = Yup.string().required().min(14);
  } else if (labwareType.name === LabwareTypeName.XENIUM) {
    formShape.barcode = Yup.string()
      .required()
      .matches(/^\d{7}$/, 'Xenium barcode should be a 7-digit number');
  }
  if (labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER) {
    formShape.sectionThickness = Yup.object().test(
      'has-at-least-one-key',
      'Section thickness must have at least one entry',
      (value) => value && Object.keys(value).length > 0
    );
  }
  if (
    labwareType.name === LabwareTypeName.VISIUM_LP ||
    labwareType.name === LabwareTypeName.VISIUM_TO ||
    labwareType.name === LabwareTypeName.VISIUM_ADH ||
    labwareType.name === LabwareTypeName.XENIUM
  ) {
    formShape.costing = Yup.string().oneOf(Object.values(SlideCosting)).required('Slide costing is a required field');
  }
  if (
    labwareType.name === LabwareTypeName.VISIUM_LP ||
    labwareType.name === LabwareTypeName.VISIUM_TO ||
    labwareType.name === LabwareTypeName.VISIUM_ADH
  ) {
    formShape.lotNumber = Yup.string()
      .required()
      .matches(/^\d{6,7}$/, 'Slide lot number should be a 6-7 digits number');
  } else if (labwareType.name === LabwareTypeName.XENIUM) {
    formShape.lotNumber = Yup.string()
      .required()
      .matches(/^\d-\d{4}[A-Z]$/, 'Slide lot number should be in format: Digit, hyphen, 4 digits, uppercase letter');
  }
  return Yup.object().shape(formShape).defined();
}

/**
 * Builds the initial layout for this plan.
 */
export function buildInitialLayoutPlan(
  sourceLabware: Array<LabwareFlaggedFieldsFragment>,
  sampleColors: Map<number, string>,
  outputLabware: NewFlaggedLabwareLayout
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
