import { GetBlockProcessingInfoQuery, LabwareFlaggedFieldsFragment } from '../../../types/sdk';
import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { motion } from '../../../dependencies/motion';
import variants from '../../../lib/motionVariants';
import Labware from '../../labware/Labware';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../../pages/sectioning';
import PinkButton from '../../buttons/PinkButton';
import Heading from '../../Heading';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../../types/stan';
import { selectOptionValues } from '../../forms';
import Modal, { ModalBody, ModalFooter } from '../../Modal';
import LayoutPlanner from '../../LayoutPlanner';
import BlueButton from '../../buttons/BlueButton';
import WhiteButton from '../../buttons/WhiteButton';
import { useFormikContext } from 'formik';
import Warning from '../../notifications/Warning';
import FormikInput from '../../forms/Input';
import { createLabwarePlanMachine } from '../../planning/labwarePlan.machine';
import { BlockFormData } from './BlockProcessing';
import { Source } from '../../../lib/machines/layout/layoutContext';
import CustomReactSelect from '../../forms/CustomReactSelect';

type BlockProcessingLabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;
  /**
   * All source labware
   */
  sourceLabware: LabwareFlaggedFieldsFragment[];
  /**
   * Destination labware plans created
   */
  outputLabware: NewFlaggedLabwareLayout;
  /**
   * Additional information required for block processing
   */
  blockProcessInfo: GetBlockProcessingInfoQuery;
  /**
   * Colours to represent source labware
   */
  sampleColors: Map<number, string>;
  /**
   * Call back handler for  delete layout operation
   * @param cid - unique id for a labware plan created
   */
  onDelete: (cid: string) => void;
  /**
   * rowIndex representing form data array index
   */
  rowIndex: number;

  notifySourceSelection: (cid: string, sourceBarcode: string) => void;
};

/**
 * Builds the initial layout for this plan.
 */
function buildInitialLayoutPlan(
  sourceLabware: Array<LabwareFlaggedFieldsFragment>,
  sampleColors: Map<number, string>,
  outputLabware: NewFlaggedLabwareLayout
) {
  return {
    sources: sourceLabware.flatMap((lw) =>
      lw.slots.flatMap((slot) =>
        slot.samples.flatMap((sample) => {
          return {
            sampleId: sample.id,
            labware: lw,
            newSection: 0,
            address: slot.address
          };
        })
      )
    ),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: new Map()
  };
}

const BlockProcessingLabwarePlan = React.forwardRef<HTMLDivElement, BlockProcessingLabwarePlanProps>(
  (
    { cid, outputLabware, blockProcessInfo, sourceLabware, sampleColors, onDelete, rowIndex, notifySourceSelection },
    ref
  ) => {
    const labwarePlanMachine = React.useMemo(() => {
      return createLabwarePlanMachine(buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware));
    }, [sourceLabware, sampleColors, outputLabware]);
    const [current, send, actor] = useMachine(labwarePlanMachine);
    const { requestError, layoutPlan } = current.context;
    const { layoutMachine } = current.context;
    const { setFieldValue, values } = useFormikContext<BlockFormData>();
    const [disableRepNumber, setDisableRepNumber] = useState<boolean>(false);

    /**
     * Fill all form fields that need to be auto-filled
     */
    React.useEffect(() => {
      sourceLabware.forEach((source, indx) => {
        setFieldValue(`discardSources.${indx}.sourceBarcode`, source.barcode);
      });
    }, [setFieldValue, rowIndex, sourceLabware]);

    React.useEffect(() => {
      setFieldValue(`plans.${rowIndex}.labwareType`, outputLabware.labwareType.name);
    }, [outputLabware, rowIndex, setFieldValue]);

    /**
     * Fill source barcode in form data
     * and
     * Notify parent about change in source (This is for auto numbering of replicate numbers)
     */
    React.useEffect(() => {
      const subscription = actor.subscribe((state) => {
        if (state.context.layoutPlan.plannedActions.size <= 0) return;
        const plannedActions: Source[] | undefined = state.context.layoutPlan.plannedActions.get('A1');
        if (plannedActions && plannedActions.length > 0) {
          setFieldValue(`plans.${rowIndex}.sourceBarcode`, plannedActions[0].labware.barcode);
          setFieldValue(`plans.${rowIndex}.replicateNumber`, plannedActions[0].replicateNumber);
          setDisableRepNumber(plannedActions[0].replicateNumber!.length > 0);
          notifySourceSelection(cid, plannedActions[0].labware.barcode);
        }
      });
      return () => subscription.unsubscribe();
    }, [setFieldValue, rowIndex, layoutPlan.plannedActions, cid, notifySourceSelection, setDisableRepNumber, actor]);
    return (
      <motion.div
        variants={variants.fadeInWithLift}
        ref={ref}
        initial={'hidden'}
        animate={'visible'}
        className="relative p-3 shadow-md"
        data-testid={'plan'}
      >
        <>
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
                <PinkButton type={'button'} onClick={() => send({ type: 'EDIT_LAYOUT' })}>
                  Edit Layout
                </PinkButton>
              )}
            </div>
            <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow-md">
              <div className="py-4 px-8 w-full space-y-4">
                {current.matches('prep.errored') && (
                  <Warning message={'There was an error creating the Labware'} error={requestError} />
                )}

                {outputLabware.labwareType.name === LabwareTypeName.PRE_BARCODED_TUBE && (
                  <FormikInput name={`plans.${rowIndex}.preBarcode`} label={'Barcode'} type={'text'} />
                )}
                <FormikInput
                  name={`plans.${rowIndex}.replicateNumber`}
                  label={'Replicate Number'}
                  type={'text'}
                  disabled={disableRepNumber}
                  value={
                    values.plans[rowIndex] && values.plans[rowIndex].replicateNumber
                      ? values.plans[rowIndex].replicateNumber
                      : ''
                  }
                />

                <CustomReactSelect
                  label={'Labware generation comments'}
                  dataTestId={'comments'}
                  name={`plans.${rowIndex}.commentId`}
                  emptyOption={true}
                  options={selectOptionValues(blockProcessInfo.comments, 'text', 'id')}
                />
              </div>

              {current.matches('prep') && (
                <div className="w-full border-t-2 border-gray-200 py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
                  <BlueButton
                    type="button"
                    onClick={() => {
                      values.plans.splice(rowIndex, 1);
                      onDelete(cid);
                    }}
                  >
                    Delete Layout
                  </BlueButton>
                </div>
              )}
            </div>
          </div>
        </>

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
                type={'button'}
                onClick={() => layoutMachine.send({ type: 'DONE' })}
                className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
              >
                Done
              </BlueButton>
              <WhiteButton
                type={'button'}
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

export default BlockProcessingLabwarePlan;
