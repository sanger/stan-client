import React, { useCallback, useEffect, useState } from 'react';
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
import { LabwareFieldsFragment, LabwareFlaggedFieldsFragment, LabwareType, SlideCosting } from '../../types/sdk';
import WhiteButton from '../buttons/WhiteButton';
import FormikInput from '../forms/Input';
import { usePrinters } from '../../lib/hooks';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { createLabwarePlanMachine } from './labwarePlan.machine';
import { buildSlotColor, buildSlotText } from '../../pages/sectioning';
import ScanInput from '../scanInput/ScanInput';
import FormikSelect from '../forms/Select';
import { Position, SECTION_GROUPS_BG_COLORS, slideCostingOptions } from '../../lib/helpers';
import { FormikErrorMessage, selectOptionValues } from '../forms';
import MutedText from '../MutedText';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';
import { PlanMutationWithGroups } from '../../pages/sectioning/Plan';

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
  onComplete: (cid: string, planResult: PlanMutationWithGroups) => void;
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
      return createLabwarePlanMachine(
        buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware, sectionThickness.toString())
      );
    }, [sourceLabware, sampleColors, outputLabware, sectionThickness]);
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

    const { requestError, layoutPlan, plan, layoutMachine, selectedSectionId } = current.context;

    const plannedLabware = plan?.plan.labware ?? [];

    const removeSectionGroup = useCallback(() => {
      layoutMachine &&
        selectedSectionId &&
        layoutMachine.send({
          type: 'REMOVE_SECTION_GROUP',
          sectionId: selectedSectionId
        });
    }, [layoutMachine, selectedSectionId]);

    const setSectionGroup = useCallback(() => {
      layoutMachine &&
        layoutMachine.send({
          type: 'ADD_SECTION_GROUP',
          sectionId: selectedSectionId
        });
    }, [layoutMachine, selectedSectionId]);

    const setSelectedSectionId = useCallback(
      (sectionId: number) => {
        send({
          type: 'ASSIGN_SELECTED_SECTION_ID',
          sectionId
        });
      },
      [send]
    );

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
          initialValues={buildInitialValues(operationType, outputLabware, layoutPlan.plannedActions)}
          validationSchema={buildValidationSchema(outputLabware.labwareType)}
          onSubmit={async (values) => {
            const newValues = {
              ...values,
              costing: isLabwareWithCosting ? values.costing : undefined
            };
            send({ type: 'CREATE_LABWARE', ...newValues });
          }}
        >
          {({ isValid, validateForm, setFieldValue }) => (
            <Form>
              <div className="md:grid md:grid-cols-2">
                <div className="py-4 flex flex-col items-center justify-between space-y-8">
                  <Labware
                    labware={outputLabware}
                    onClick={() => send({ type: 'EDIT_LAYOUT' })}
                    name={outputLabware.labwareType.name}
                    slotText={(address) => buildSlotText(layoutPlan, address)}
                    slotColor={(address) => buildSlotColor(layoutPlan, address)}
                    barcodeInfoPosition={Position.TopRight}
                    highlightedSlots={highlightedSlots}
                    sectionGroups={layoutPlan.plannedActions}
                  />

                  {current.matches('prep') && (
                    <PinkButton
                      onClick={async () => {
                        send({ type: 'EDIT_LAYOUT' });
                        await validateForm();
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
                          {selectOptionValues(slideCostingOptions, 'label', 'value').map((cost) => (
                            <option key={cost.value} value={cost.value}>
                              {cost.value}
                            </option>
                          ))}
                        </FormikSelect>
                      </>
                    )}

                    {outputLabware.labwareType.name !== LabwareTypeName.FETAL_WASTE_CONTAINER && (
                      <div className="p-4 space-y-2 space-x-2 bg-gray-100">
                        <div className={'grid grid-cols-2 py-2 text-gray-500 text-center'}>
                          <div>Section address(es)</div>
                          <div>Section Thickness</div>
                        </div>
                        <div className={'flex flex-col space-y-4'}>
                          {Object.keys(current.context.layoutPlan.plannedActions).length === 0 && (
                            <MutedText>
                              Please transfer samples to the slot before entering the section thickness.
                            </MutedText>
                          )}
                          {Object.keys(current.context.layoutPlan.plannedActions).map((sectionGroupId) => (
                            <div key={sectionGroupId} className="grid grid-cols-2 text-center">
                              <span className="font-medium text-gray-800 tracking-wide" data-testid="section-addresses">
                                {Array.from(current.context.layoutPlan.plannedActions[sectionGroupId].addresses).join(
                                  ', '
                                )}
                              </span>
                              <FormikInput
                                className="focus:ring-sdb-100 focus:border-sdb-100 block h-8 bg-white border border-gray-300 rounded-md
                                  disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-300 mx-auto w-24 text-center"
                                label={''}
                                disabled={current.matches('printing') || current.matches('done')}
                                name={`plannedActions[${sectionGroupId}].source.sampleThickness`}
                                data-testid={`section-thickness`}
                                type="number"
                                min={0.5}
                                step={0.5}
                                onFocus={() => {
                                  setHighlightedSlots(
                                    current.context.layoutPlan.plannedActions[sectionGroupId].addresses
                                  );
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

              <Modal show={current.matches('editingLayout')}>
                <ModalBody>
                  <Heading level={3}>Set Layout</Heading>
                  {layoutMachine && (
                    <LayoutPlanner actor={layoutMachine}>
                      <div className="my-2 text-gray-900 text-xs leading-normal">
                        <p>
                          If section(s) may fill more that one slotin the destination labware, you can define a new
                          section using the 'Define section' button.
                        </p>
                        <p>
                          To add sections to a slot, select a source for the buttons on the right, and then click a
                          destination slot or the defined sections. Clicking a filled slot/section will empty it.
                        </p>
                      </div>
                      <Heading level={5}>Define sections</Heading>
                      <p className="my-2 text-gray-900 text-xs leading-normal">
                        Hold 'Ctrl' (Cmd for Mac) key to select the slots that you would like to group into a section,
                        then click a section color to create it. To remove a section, select the section color that you
                        would like to remove and click 'Remove section'.
                      </p>
                      <div className="grid grid-cols-2">
                        <div className="grid grid-cols-19 gap-2">
                          {layoutMachine &&
                            SECTION_GROUPS_BG_COLORS.map((bgColor, index) => {
                              const highlightClass =
                                selectedSectionId === index ? `ring-3 ring-offset-2 ring-gray-700` : '';
                              return (
                                <div
                                  data-testid={`section-group-color-${index}`}
                                  className={`h-5 w-5 rounded-full ${bgColor} ${highlightClass}`}
                                  onClick={() => {
                                    setSelectedSectionId(index);
                                  }}
                                ></div>
                              );
                            })}
                        </div>
                        <div className="text-xs font-medium flex flex-row-reverse cursor-pointer">
                          <span
                            data-testid="remove-section-button"
                            onClick={removeSectionGroup}
                            className="p-2 shadow-xs  text-red-700 underline hover:bg-gray-100 focus:border-sdb-400 focus:shadow-md-outline-sdb active:bg-gray-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                          >
                            Remove section
                          </span>
                          <span
                            data-testid="create-update-section-button"
                            onClick={setSectionGroup}
                            className="p-2 shadow-xs  text-red-700 underline hover:bg-gray-100 focus:border-sdb-400 focus:shadow-md-outline-sdb active:bg-gray-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                          >
                            Create/Update section
                          </span>
                        </div>
                      </div>
                    </LayoutPlanner>
                  )}
                </ModalBody>
                {layoutMachine && (
                  <ModalFooter>
                    <BlueButton
                      onClick={async () => {
                        layoutMachine.send({ type: 'DONE' });
                        if (layoutMachine.getSnapshot().matches('done')) {
                          await setFieldValue(
                            'plannedActions',
                            layoutMachine.getSnapshot().context.layoutPlan.plannedActions
                          );
                          await validateForm();
                        }
                      }}
                      className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Done
                    </BlueButton>
                  </ModalFooter>
                )}
              </Modal>
            </Form>
          )}
        </Formik>
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
   * The Slide lot number (only for Visium slides)
   */
  lotNumber?: string;
  /**
   * The Slide costing (only for Visium slides)
   */
  costing?: SlideCosting;

  plannedActions: Record<string, PlannedSectionDetails>;
};

/**
 * The initial values for the labware plan form
 */
function buildInitialValues(
  operationType: string,
  labwareLayout: NewFlaggedLabwareLayout,
  plannedActions: Record<string, PlannedSectionDetails>
): FormValues {
  let formValues: FormValues = {
    operationType,
    plannedActions
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
  return formValues;
}

/**
 * Builds a yup validator for the labware plan form
 * @param labwareType the labware type of the labware plan
 */
function buildValidationSchema(labwareType: LabwareType): Yup.AnyObjectSchema {
  type FormShape = {
    plannedActions?: Yup.ObjectSchema<any>;
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
    formShape.plannedActions = Yup.object()
      .shape(
        {} as Record<string, Yup.ObjectSchema<any>> // allows dynamic keys
      )
      .test('at-least-one-sampleThickness', 'Section thickness must have at least one entry', (plannedActions) => {
        if (!plannedActions) return false; // required

        return Object.values(plannedActions).some(
          (section) =>
            section?.source?.sampleThickness !== undefined &&
            section?.source?.sampleThickness !== null &&
            section?.source?.sampleThickness !== ''
        );
      });
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
  outputLabware: NewFlaggedLabwareLayout,
  globalSectionThickness?: string
) {
  return {
    sources: sourceLabware.flatMap((lw) => {
      return lw.slots.flatMap((slot) => {
        return slot.samples.flatMap((sample) => {
          return {
            sampleId: sample.id,
            labware: lw,
            newSection: 0,
            address: slot.address,
            sampleThickness: globalSectionThickness
          };
        });
      });
    }),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: {} as Record<string, PlannedSectionDetails>
  };
}
