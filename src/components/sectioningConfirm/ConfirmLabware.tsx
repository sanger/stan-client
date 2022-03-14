import React, { useEffect } from "react";
import { useMachine, useSelector } from "@xstate/react";
import variants from "../../lib/motionVariants";
import Labware from "../labware/Labware";
import PinkButton from "../buttons/PinkButton";
import Modal, { ModalBody, ModalFooter } from "../Modal";
import Heading from "../Heading";
import BlueButton from "../buttons/BlueButton";
import { motion } from "framer-motion";
import { optionValues } from "../forms";
import LayoutPlanner from "../LayoutPlanner";
import Label from "../forms/Label";
import WhiteButton from "../buttons/WhiteButton";
import { sortRightDown } from "../../lib/helpers/labwareHelper";
import { Select } from "../forms/Select";
import LabwareComments from "./LabwareComments";
import classNames from "classnames";
import {
  buildSlotColor,
  buildSlotSecondaryText,
  buildSlotText,
} from "../../pages/sectioning";
import { createConfirmLabwareMachine } from "./confirmLabware.machine";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
import {
  CommentFieldsFragment,
  ConfirmSectionLabware,
  LabwareFieldsFragment,
} from "../../types/sdk";
import { selectConfirmOperationLabware } from "./index";
import RemoveButton from "../buttons/RemoveButton";

interface ConfirmLabwareProps {
  originalLayoutPlan: LayoutPlan;
  comments: Array<CommentFieldsFragment>;
  onChange: (
    labware: ConfirmSectionLabware,
    sourceLabwares: LabwareFieldsFragment[]
  ) => void;
  onRemoveClick: (labwareBarcode: string) => void;
  disableSectionNumbers?: boolean;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({
  originalLayoutPlan,
  comments,
  onChange,
  onRemoveClick,
  disableSectionNumbers = false,
}) => {
  const [current, send, service] = useMachine(
    createConfirmLabwareMachine(
      comments,
      originalLayoutPlan.destinationLabware,
      originalLayoutPlan
    )
  );
  const confirmOperationLabware = useSelector(
    service,
    selectConfirmOperationLabware
  );

  const { addressToCommentMap, labware, layoutPlan } = current.context;
  const { layoutMachine } = current.children;

  const gridClassNames = classNames(
    {
      "sm:grid-cols-1": labware.labwareType.numColumns === 1,
      "sm:grid-cols-2": labware.labwareType.numColumns === 2,
    },
    "grid grid-cols-1 gap-x-8 gap-y-2"
  );

  useEffect(() => {
    if (confirmOperationLabware) {
      onChange(
        confirmOperationLabware,
        Array.from(layoutPlan.plannedActions.values()).flatMap((sources) =>
          Array.from(sources.values()).map((source) => source.labware)
        )
      );
    }
  }, [onChange, confirmOperationLabware, layoutPlan.plannedActions]);

  /***Update section numbers whenever there is an update in section numbers in parent**/
  useEffect(() => {
    send("UPDATE_ALL_SECTION_NUMBERS", originalLayoutPlan);
  }, [originalLayoutPlan, send]);

  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={"hidden"}
      animate={"visible"}
      className="relative p-3 shadow"
    >
      <RemoveButton onClick={() => onRemoveClick(labware.barcode!)} />
      <div
        data-testid={`div-slide-${labware.barcode}`}
        className="md:grid md:grid-cols-2"
      >
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
            <div data-testid="labware-comments" className={gridClassNames}>
              {sortRightDown(labware.slots).map((slot) => (
                <LabwareComments
                  key={slot.address}
                  slot={slot}
                  value={addressToCommentMap.get(slot.address) ?? ""}
                  disabledComment={current.matches("done")}
                  disabledSectionNumber={disableSectionNumbers}
                  comments={comments}
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
              {optionValues(comments, "text", "id")}
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
                  Click a slot to increase the number of sections in that slot.
                </p>
                <p>
                  To reduce the number of sections in a slot, use Ctrl-Click.
                </p>
              </div>
            </LayoutPlanner>
          )}
        </ModalBody>
        <ModalFooter>
          <BlueButton
            onClick={() => {
              layoutMachine.send({ type: "DONE" });
            }}
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
