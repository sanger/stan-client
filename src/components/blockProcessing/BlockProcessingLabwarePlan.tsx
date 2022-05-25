import {
  GetTissueBlockProcessingInfoQuery,
  LabwareFieldsFragment,
} from "../../types/sdk";
import React from "react";
import { useMachine } from "@xstate/react";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Labware from "../labware/Labware";
import {
  buildSlotColor,
  buildSlotSecondaryText,
  buildSlotText,
} from "../../pages/sectioning";
import PinkButton from "../buttons/PinkButton";
import Heading from "../Heading";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import FormikSelect from "../forms/Select";
import { optionValues } from "../forms";
import Modal, { ModalBody, ModalFooter } from "../Modal";
import LayoutPlanner from "../LayoutPlanner";
import BlueButton from "../buttons/BlueButton";
import WhiteButton from "../buttons/WhiteButton";
import { useFormikContext } from "formik";
import Warning from "../notifications/Warning";
import FormikInput from "../forms/Input";
import { createLabwarePlanMachine } from "../planning/labwarePlan.machine";

type BlockProcessingLabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;
  sourceLabware: LabwareFieldsFragment[];
  outputLabware: NewLabwareLayout;
  blockProcessInfo: GetTissueBlockProcessingInfoQuery;
  sampleColors: Map<number, string>;
  onDelete: (cid: string) => void;
  rowIndex: number;
};

/**
 * Builds the initial layout for this plan.
 */
function buildInitialLayoutPlan(
  sourceLabware: Array<LabwareFieldsFragment>,
  sampleColors: Map<number, string>,
  outputLabware: NewLabwareLayout
) {
  return {
    sources: sourceLabware.flatMap((lw) =>
      lw.slots.flatMap((slot) =>
        slot.samples.flatMap((sample) => {
          return {
            sampleId: sample.id,
            labware: lw,
            newSection: 0,
            address: slot.address,
          };
        })
      )
    ),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: new Map(),
  };
}

const BlockProcessingLabwarePlan = React.forwardRef<
  HTMLDivElement,
  BlockProcessingLabwarePlanProps
>(
  (
    {
      cid,
      outputLabware,
      blockProcessInfo,
      sourceLabware,
      sampleColors,
      onDelete,
      rowIndex,
    },
    ref
  ) => {
    const [current, send] = useMachine(
      createLabwarePlanMachine(
        buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware)
      )
    );
    const { requestError, layoutPlan } = current.context;
    const { layoutMachine } = current.children;
    const { setFieldValue } = useFormikContext();

    React.useEffect(() => {
      setFieldValue(`values.${rowIndex}.replicateNumber`, rowIndex + "");
    }, [setFieldValue, rowIndex]);
    return (
      <motion.div
        variants={variants.fadeInWithLift}
        ref={ref}
        initial={"hidden"}
        animate={"visible"}
        className="relative p-3 shadow"
      >
        <>
          <div className="md:grid md:grid-cols-2">
            <div className="py-4 flex flex-col items-center justify-between space-y-8">
              <Labware
                labware={outputLabware}
                onClick={() => send({ type: "EDIT_LAYOUT" })}
                name={outputLabware.labwareType.name}
                slotText={(address) => buildSlotText(layoutPlan, address)}
                slotSecondaryText={(address) =>
                  buildSlotSecondaryText(layoutPlan, address)
                }
                slotColor={(address) => buildSlotColor(layoutPlan, address)}
              />

              {current.matches("prep") && (
                <PinkButton onClick={() => send({ type: "EDIT_LAYOUT" })}>
                  Edit Layout
                </PinkButton>
              )}
            </div>
            <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow">
              <div className="py-4 px-8 w-full space-y-4">
                {current.matches("prep.errored") && (
                  <Warning
                    message={
                      requestError?.message ??
                      "There was an error creating the Labware"
                    }
                    error={requestError}
                  />
                )}
                <FormikInput
                  name={`values.${rowIndex}.labwareType`}
                  value={outputLabware.labwareType.name}
                  label={""}
                  type={"hidden"}
                />
                {outputLabware.labwareType.name ===
                  LabwareTypeName.PRE_BARCODED_TUBE && (
                  <FormikInput
                    name={`values.${rowIndex}.preBarcode`}
                    label={"Barcode"}
                    type={"text"}
                  />
                )}
                <FormikInput
                  name={`values.${rowIndex}.replicateNumber`}
                  label={"Replicate Number"}
                  type={"text"}
                  disabled={true}
                />

                <FormikSelect
                  label={"Medium"}
                  name={`values.${rowIndex}.medium`}
                  emptyOption={true}
                >
                  {optionValues(blockProcessInfo.mediums, "name", "name")}
                </FormikSelect>
                <FormikSelect
                  label={"Processing comments"}
                  name={`values.${rowIndex}.comments`}
                  emptyOption={true}
                >
                  {optionValues(blockProcessInfo.comments, "text", "id")}
                </FormikSelect>
                <FormikInput
                  label={"Discard source?"}
                  name={`values.${rowIndex}.discardSource`}
                  type={"checkbox"}
                />
              </div>

              {current.matches("prep") && (
                <div className="w-full border-t-2 border-gray-200 py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
                  <WhiteButton onClick={() => onDelete(cid)}>
                    Delete Layout
                  </WhiteButton>
                </div>
              )}
            </div>
          </div>
        </>

        <Modal show={current.matches("editingLayout")}>
          <ModalBody>
            <Heading level={3}>Set Layout</Heading>
            {layoutMachine && (
              <LayoutPlanner actor={layoutMachine}>
                <div className="my-2">
                  <p className="text-gray-900 text-sm leading-normal">
                    To add sections to a slot, select a source for the buttons
                    on the right, and then click a destination slot. Clicking a
                    filled slot will empty it.
                  </p>
                </div>
              </LayoutPlanner>
            )}
          </ModalBody>
          <ModalFooter>
            <BlueButton
              onClick={() => layoutMachine.send({ type: "DONE" })}
              className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </BlueButton>
            <WhiteButton
              onClick={() => layoutMachine.send({ type: "CANCEL" })}
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

export default BlockProcessingLabwarePlan;
