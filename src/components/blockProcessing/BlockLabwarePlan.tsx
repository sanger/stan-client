import {
  GetTissueBlockProcessingInfoQuery,
  LabwareFieldsFragment,
} from "../../types/sdk";
import React, { useContext } from "react";
import { useMachine, useSelector } from "@xstate/react";
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
import { Form, Formik } from "formik";
import Warning from "../notifications/Warning";
import FormikInput from "../forms/Input";
import { createLabwarePlanMachine } from "../planning/labwarePlan.machine";
import { BlockFormValue } from "./BlockProcess";

type BlockLabwarePlanProps = {
  sourceLabware: LabwareFieldsFragment[];
  outputLabware: NewLabwareLayout;
  blockFormValue: BlockFormValue;
  blockProcessInfo: GetTissueBlockProcessingInfoQuery;
  operationType: string;

  sampleColors: Map<number, string>;
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
    sources: sourceLabware.flatMap((lw) => {
      return lw.slots.flatMap((slot) => {
        return slot.samples.flatMap((sample) => {
          return {
            sampleId: sample.id,
            labware: lw,
            newSection: 0,
            address: slot.address,
          };
        });
      });
    }),
    sampleColors,
    destinationLabware: outputLabware,
    plannedActions: new Map(),
  };
}

const BlockLabwarePlan: React.FC<BlockLabwarePlanProps> = ({
  blockFormValue,
  outputLabware,
  blockProcessInfo,
  sourceLabware,
  sampleColors,
  operationType,
}) => {
  const [current, send, service] = useMachine(
    createLabwarePlanMachine(
      buildInitialLayoutPlan(sourceLabware, sampleColors, outputLabware)
    )
  );
  const { requestError, layoutPlan, plan } = current.context;
  const { layoutMachine } = current.children;
  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={"hidden"}
      animate={"visible"}
      className="relative p-3 shadow"
    >
      <Form>
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
                label={""}
                type={"hidden"}
                name={"operationType"}
                value={operationType}
              />

              {outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP && (
                <FormikInput
                  name={"barcode"}
                  label={"Barcode"}
                  type={"text"}
                  disabled={
                    current.matches("printing") || current.matches("done")
                  }
                />
              )}
              <FormikInput
                name={"replicateNumber"}
                label={"Replicate Number"}
                type={"text"}
              />

              <FormikSelect label={"Medium"} name={"medium"} emptyOption={true}>
                {optionValues(blockProcessInfo.mediums, "name", "name")}
              </FormikSelect>
              <FormikSelect
                label={"Processing comments"}
                name={"comments"}
                emptyOption={true}
              >
                {optionValues(blockProcessInfo.comments, "text", "text")}
              </FormikSelect>
            </div>

            {current.matches("prep") && (
              <div className="w-full border-t-2 border-gray-200 py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
                <WhiteButton onClick={() => {}}>Delete Layout</WhiteButton>
              </div>
            )}
          </div>
        </div>
      </Form>

      <Modal show={current.matches("editingLayout")}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutMachine && (
            <LayoutPlanner actor={layoutMachine}>
              <div className="my-2">
                <p className="text-gray-900 text-sm leading-normal">
                  To add sections to a slot, select a source for the buttons on
                  the right, and then click a destination slot. Clicking a
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
};

export default BlockLabwarePlan;
