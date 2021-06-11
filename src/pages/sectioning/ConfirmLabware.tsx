import React, { useContext, useEffect } from "react";
import { useMachine, useSelector } from "@xstate/react";
import variants from "../../lib/motionVariants";
import Labware from "../../components/labware/Labware";
import PinkButton from "../../components/buttons/PinkButton";
import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
import Heading from "../../components/Heading";
import BlueButton from "../../components/buttons/BlueButton";
import { motion } from "framer-motion";
import { optionValues } from "../../components/forms";
import LayoutPlanner from "../../components/LayoutPlanner";
import Label from "../../components/forms/Label";
import WhiteButton from "../../components/buttons/WhiteButton";
import { sortRightDown } from "../../lib/helpers/labwareHelper";
import { Select } from "../../components/forms/Select";
import LabwareComments from "./LabwareComments";
import classNames from "classnames";
import {
  buildSlotColor,
  buildSlotSecondaryText,
  buildSlotText,
  selectConfirmOperationLabware,
} from "./index";
import { createSectioningConfirmMachine } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmMachine";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
import { SectioningPageContext } from "../Sectioning";

interface ConfirmLabwareProps {
  originalLayoutPlan: LayoutPlan;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({
  originalLayoutPlan,
}) => {
  const model = useContext(SectioningPageContext)!;
  const [current, send, service] = useMachine(
    createSectioningConfirmMachine(
      model.context.comments,
      originalLayoutPlan.destinationLabware,
      originalLayoutPlan
    )
  );
  const confirmOperationLabware = useSelector(
    service,
    selectConfirmOperationLabware
  );

  const commitConfirmation = model.commitConfirmation;
  useEffect(() => {
    if (confirmOperationLabware) {
      commitConfirmation(confirmOperationLabware);
    }
  }, [commitConfirmation, confirmOperationLabware]);

  const { addressToCommentMap, labware, layoutPlan } = current.context;

  const { layoutMachine } = current.children;

  const gridClassNames = classNames(
    {
      "sm:grid-cols-1": labware.labwareType.numColumns === 1,
      "sm:grid-cols-2": labware.labwareType.numColumns === 2,
    },
    "grid grid-cols-1 gap-x-8 gap-y-2"
  );

  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={"hidden"}
      animate={"visible"}
      className="relative p-3 shadow"
    >
      <div className="md:grid md:grid-cols-2">
        <div className="py-4 flex flex-col items-center justify-between space-y-8">
          <Labware
            labware={labware}
            onClick={() => send({ type: "EDIT_LAYOUT" })}
            slotText={(address) => buildSlotText(layoutPlan, address)}
            slotSecondaryText={(address) =>
              buildSlotSecondaryText(layoutPlan, address)
            }
            slotColor={(address) => buildSlotColor(layoutPlan, address)}
          />

          <PinkButton
            disabled={current.matches("done")}
            onClick={() => send({ type: "EDIT_LAYOUT" })}
          >
            Edit Layout
          </PinkButton>
        </div>
        <div className="p-4 space-y-8 space-x-2 bg-gray-100">
          <Heading level={3} showBorder={false}>
            Comments
          </Heading>

          <div className="w-full space-y-4">
            <div className={gridClassNames}>
              {sortRightDown(labware.slots).map((slot) => (
                <LabwareComments
                  key={slot.address}
                  slot={slot}
                  value={addressToCommentMap.get(slot.address) ?? ""}
                  disabled={current.matches("done")}
                  comments={model.context.comments}
                  layoutPlan={layoutPlan}
                  onCommentChange={(e) => {
                    send({
                      type: "SET_COMMENT_FOR_ADDRESS",
                      address: slot.address,
                      commentId: e.currentTarget.value,
                    });
                  }}
                  onSectionNumberChange={(
                    slotAddress,
                    sectionIndex,
                    sectionNumber
                  ) => {
                    send({
                      type: "UPDATE_SECTION_NUMBER",
                      slotAddress,
                      sectionIndex,
                      sectionNumber,
                    });
                  }}
                />
              ))}
            </div>
          </div>
          <Label name={"All slots:"}>
            <Select
              disabled={current.matches("done")}
              onChange={(e) =>
                send({
                  type: "SET_COMMENT_FOR_ALL",
                  commentId: e.currentTarget.value,
                })
              }
            >
              <option />
              {optionValues(model.context.comments, "text", "id")}
            </Select>
          </Label>
        </div>
      </div>

      <Modal show={current.matches("editingLayout")}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutMachine && (
            <LayoutPlanner actor={layoutMachine}>
              <div className="my-2">
                <p className="text-gray-900 text-sm leading-normal">
                  Click a slot to reduce its number of confirmed sections. (You
                  can return a slot to its original planned value by clicking it
                  again once it becomes empty).
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
            className="mt-3 w-full sm:mt-0 sm:ml-3"
          >
            Cancel
          </WhiteButton>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default ConfirmLabware;
