import { GetBlockProcessingInfoQuery, LabwareFlaggedFieldsFragment, TissueBlockContent } from '../../../types/sdk';
import React from 'react';
import { useMachine } from '@xstate/react';
import { motion } from '../../../dependencies/motion';
import variants from '../../../lib/motionVariants';
import Labware from '../../labware/Labware';
import { buildSlotColor, buildSlotText } from '../../../pages/sectioning';
import PinkButton from '../../buttons/PinkButton';
import Heading from '../../Heading';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../../types/stan';
import Modal, { ModalBody, ModalFooter } from '../../Modal';
import LayoutPlanner from '../../LayoutPlanner';
import BlueButton from '../../buttons/BlueButton';
import WhiteButton from '../../buttons/WhiteButton';
import { useFormikContext } from 'formik';
import Warning from '../../notifications/Warning';
import FormikInput from '../../forms/Input';
import { createLabwarePlanMachine } from '../../planning/labwarePlan.machine';
import { BlockFormData } from './BlockProcessing';
import CustomReactSelect, { OptionType } from '../../forms/CustomReactSelect';
import { selectOptionValues } from '../../forms';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../Table';

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
            newSection: '',
            address: slot.address
          };
        })
      )
    ),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: {}
  };
}

function validatePreBarcode(value: string) {
  let error;
  if (value && !value.match(/[a-zA-Z]{2}\d{8}/)) {
    error = 'Barcode should be in the format with two letters followed by 8 numbers';
  }
  return error;
}

const BlockProcessingLabwarePlan = React.forwardRef<HTMLDivElement, BlockProcessingLabwarePlanProps>(
  ({ cid, outputLabware, blockProcessInfo, sourceLabware, sampleColors, onDelete }, ref) => {
    const labwarePlanMachine = React.useMemo(() => {
      return createLabwarePlanMachine(buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware));
    }, [sourceLabware, sampleColors, outputLabware]);
    const [current, send, actor] = useMachine(labwarePlanMachine);
    const { requestError, layoutPlan } = current.context;
    const { layoutMachine } = current.context;
    const { setFieldValue, values, setValues } = useFormikContext<BlockFormData>();
    /**
     * Fill all form fields that need to be auto-filled
     */
    React.useEffect(() => {
      sourceLabware.forEach((source, indx) => {
        setFieldValue(`discardSources.${indx}.sourceBarcode`, source.barcode);
      });
    }, [setFieldValue, sourceLabware]);

    /**
     * Fill source barcode in form data
     * and
     * Notify parent about change in source (This is for auto numbering of replicate numbers)
     */
    React.useEffect(() => {
      const subscription = actor.subscribe((state) => {
        if (!state.context.layoutPlan.plannedActions) return;
        const planContents: Map<string, TissueBlockContent> = new Map();
        Object.values(state.context.layoutPlan.plannedActions).forEach((plannedAction) => {
          const sourceBarcode = plannedAction.source.labware.barcode;
          const entry = {
            addresses: Array.from(plannedAction.addresses),
            sourceBarcode,
            replicate: plannedAction.source.replicateNumber,
            sourceSampleId: plannedAction.source.sampleId,
            isEditReplicateDisabled:
              plannedAction.source.replicateNumber && parseInt(plannedAction.source.replicateNumber) > 0
          };

          const existing = planContents.get(sourceBarcode);
          planContents.set(
            sourceBarcode,
            existing ? { ...existing, addresses: [...existing.addresses, ...entry.addresses] } : entry
          );
        });
        setValues((prev) => {
          const plan = prev.plans.get(cid);
          const updatedPlan = {
            ...plan,
            contents: Array.from(planContents.values()),
            labwareType: outputLabware.labwareType.name
          };
          return { ...prev, plans: new Map(prev.plans).set(cid, updatedPlan) };
        });
      });
      return () => subscription.unsubscribe();
    }, [setValues, layoutPlan.plannedActions, cid, actor, outputLabware.labwareType.name]);

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
                slotColor={(address) => buildSlotColor(layoutPlan, address)}
              />

              {current.matches('prep') && (
                <div className="w-full py-3 px-4 flex flex-row justify-center space-x-3">
                  <PinkButton type={'button'} onClick={() => send({ type: 'EDIT_LAYOUT' })}>
                    Edit Layout
                  </PinkButton>
                  <BlueButton
                    type="button"
                    onClick={async () => {
                      await setValues((prev) => {
                        prev.plans.delete(cid);
                        return { ...prev };
                      });
                      onDelete(cid);
                    }}
                  >
                    Delete Layout
                  </BlueButton>
                </div>
              )}
            </div>
            <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow-md">
              <div className="py-4 px-8 w-full space-y-4" data-testid="planned-source-table">
                {current.matches('prep.errored') && (
                  <Warning message={'There was an error creating the Labware'} error={requestError} />
                )}

                {outputLabware.labwareType.name === LabwareTypeName.PRE_BARCODED_TUBE && (
                  <FormikInput
                    name={`plans.${cid}.preBarcode`}
                    label={'Barcode'}
                    type={'text'}
                    validate={validatePreBarcode}
                  />
                )}
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Source Barcode</TableHeader>
                      <TableHeader>Replicate Number</TableHeader>
                      <TableHeader>Labware generation comments</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {values.plans.get(cid)?.contents &&
                      values.plans.get(cid)?.contents?.map((tissueContent, index) => (
                        <tr key={`${tissueContent.sourceBarcode}-${index}`}>
                          <TableCell>{tissueContent.sourceBarcode}</TableCell>
                          <TableCell>
                            <FormikInput
                              validateField={(number: number) => {
                                if (number === 0) return 'Replicate number is required';
                                return '';
                              }}
                              name={`replicateNumber`}
                              data-testid="replicate-number"
                              type={'number'}
                              label={''}
                              disabled={tissueContent.isEditReplicateDisabled}
                              value={tissueContent.replicate ?? ''}
                              onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                const plans = values.plans;
                                const plan = values.plans.get(cid);
                                plan!.contents[index].replicate = event.target.value;
                                plans.set(cid, plan!);
                                await setFieldValue('plans', plans);
                              }}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <CustomReactSelect
                              label={''}
                              dataTestId={'comments'}
                              value={tissueContent.commentId ?? ''}
                              onChange={async (val) => {
                                const plans = values.plans;
                                const plan = values.plans.get(cid);
                                plan!.contents[index].commentId = parseInt((val as OptionType).value);
                                plans.set(cid, plan!);
                                await setFieldValue('plans', plans);
                              }}
                              emptyOption={true}
                              options={selectOptionValues(blockProcessInfo.comments, 'text', 'id')}
                            />
                          </TableCell>
                        </tr>
                      ))}
                  </TableBody>
                </Table>
              </div>
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
