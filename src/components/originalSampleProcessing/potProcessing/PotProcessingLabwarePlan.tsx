import { GetPotProcessingInfoQuery, LabwareFlaggedFieldsFragment } from '../../../types/sdk';
import React from 'react';
import { useMachine } from '@xstate/react';
import { motion } from '../../../dependencies/motion';
import variants from '../../../lib/motionVariants';
import Labware from '../../labware/Labware';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../../../pages/sectioning';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../../types/stan';
import { selectOptionValues } from '../../forms';
import BlueButton from '../../buttons/BlueButton';
import { useFormikContext } from 'formik';
import Warning from '../../notifications/Warning';
import { createLabwarePlanMachine } from '../../planning/labwarePlan.machine';
import { PotFormData } from './PotProcessing';
import CustomReactSelect, { OptionType } from '../../forms/CustomReactSelect';

type PotProcessingLabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;
  /**
   * Source labware scanned
   */
  sourceLabware: LabwareFlaggedFieldsFragment[];
  /**
   * Destination labware plans created
   */
  outputLabware: NewFlaggedLabwareLayout;
  /**
   * Additional information required for pot processing
   */
  potProcessInfo: GetPotProcessingInfoQuery;
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
  /**
   * Initial fixative value selected
   */
  fixative?: string;
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
    plannedActions:
      sourceLabware.length > 0
        ? new Map().set('A1', [
            {
              sampleId: sourceLabware[0].slots[0].samples[0].id,
              labware: sourceLabware[0],
              newSection: 0
            }
          ])
        : new Map()
  };
}

const PotProcessingLabwarePlan = React.forwardRef<HTMLDivElement, PotProcessingLabwarePlanProps>(
  ({ cid, outputLabware, potProcessInfo, sourceLabware, sampleColors, onDelete, rowIndex, fixative }, ref) => {
    const labwarePlanMachine = React.useMemo(() => {
      return createLabwarePlanMachine(buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware));
    }, [sourceLabware, sampleColors, outputLabware]);
    const [current] = useMachine(labwarePlanMachine);
    const { requestError, layoutPlan } = current.context;
    const { values, setFieldValue } = useFormikContext<PotFormData>();

    /**
     * Set form values that need to be auto filled
     */
    React.useEffect(() => {
      if (sourceLabware.length > 0) {
        setFieldValue('sourceBarcode', sourceLabware[0].barcode);
      }

      if (outputLabware) {
        setFieldValue(`plans.${rowIndex}.labwareType`, outputLabware.labwareType.name);
      }

      //Initialize with selected fixative only during creation
      if (!values.plans[rowIndex]) {
        setFieldValue(
          `plans.${rowIndex}.fixative`,
          outputLabware.labwareType.name === LabwareTypeName.FETAL_WASTE_CONTAINER ? 'None' : fixative
        );
      }
    }, [values, setFieldValue, rowIndex, fixative, outputLabware, sourceLabware]);

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
                name={outputLabware.labwareType.name}
                slotText={(address) => buildSlotText(layoutPlan, address)}
                slotSecondaryText={(address) => buildSlotSecondaryText(layoutPlan, address)}
                slotColor={(address) => buildSlotColor(layoutPlan, address)}
              />
            </div>
            <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow-md">
              <div className="py-4 px-8 w-full space-y-4">
                {current.matches('prep.errored') && (
                  <Warning message={'There was an error creating the Labware'} error={requestError} />
                )}
                {outputLabware.labwareType.name === LabwareTypeName.POT && (
                  <CustomReactSelect
                    dataTestId={'pot-fixative'}
                    label={'Fixative'}
                    name={`plans.${rowIndex}.fixative`}
                    emptyOption={true}
                    value={values.plans[rowIndex]?.fixative}
                    options={selectOptionValues(potProcessInfo.fixatives, 'name', 'name')}
                    handleChange={(val) => {
                      setFieldValue(`plans.${rowIndex}.fixative`, (val as OptionType).label);
                    }}
                  />
                )}

                <CustomReactSelect
                  dataTestId={'pot-comments'}
                  label={'Labware generation comments'}
                  name={`plans.${rowIndex}.commentId`}
                  emptyOption={true}
                  options={selectOptionValues(potProcessInfo.comments, 'text', 'id')}
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
      </motion.div>
    );
  }
);

export default PotProcessingLabwarePlan;
