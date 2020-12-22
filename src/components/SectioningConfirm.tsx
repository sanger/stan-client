import React, { ChangeEvent } from "react";
import { useActor } from "@xstate/react";
import variants from "../lib/motionVariants";
import Labware from "./Labware";
import PinkButton from "./buttons/PinkButton";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import Heading from "./Heading";
import BlueButton from "./buttons/BlueButton";
import { motion } from "framer-motion";
import { optionValues } from "./forms";
import {
  editLayout,
  setCommentForAddress,
  setCommentForAll,
  toggleCancel,
} from "../lib/machines/sectioning/sectioningConfirm/sectioningConfirmEvents";
import LayoutPlanner from "./LayoutPlanner";
import { cancel, done } from "../lib/machines/layout/layoutEvents";
import { TableCell } from "./Table";
import RemoveIcon from "./icons/RemoveIcon";
import {
  SectioningConfirmActorRef,
  SectioningConfirmEvent,
  SectioningConfirmMachineType,
} from "../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";
import classNames from "classnames";
import MutedText from "./MutedText";
import Label from "./forms/Label";
import WhiteButton from "./buttons/WhiteButton";
import { rowMajor } from "../lib/helpers/labwareHelper";
import { Comment, LabwareLayoutFragment } from "../types/graphql";
import { LayoutPlan } from "../lib/machines/layout/layoutContext";
import { Select } from "./forms/Select";

interface SectioningConfirmProps {
  actor: SectioningConfirmActorRef;
}

const SectioningConfirm: React.FC<SectioningConfirmProps> = ({ actor }) => {
  const [current, send] = useActor<
    SectioningConfirmEvent,
    SectioningConfirmMachineType["state"]
  >(actor);

  const {
    layoutPlan,
    labware,
    comments,
    addressToCommentMap,
  } = current.context;

  const { layoutMachine } = current.children;

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
            onClick={() => send(editLayout())}
            labware={labware}
            slotText={(slot) =>
              layoutPlan.plannedActions.get(slot.address)?.labware.barcode
            }
            slotColor={(slot) => {
              const action = layoutPlan.plannedActions.get(slot.address);
              if (action) {
                return layoutPlan.sampleColors.get(action.sampleId);
              }
            }}
          />

          <PinkButton onClick={() => send(editLayout())}>
            Edit Layout
          </PinkButton>
        </div>
        <div className="p-4 space-y-8 space-x-2 bg-gray-100">
          <Heading level={3} showBorder={false}>
            Comments
          </Heading>

          <div className="w-full space-y-4">
            <div
              className={`grid grid-cols-1 sm:grid-cols-${labware.labwareType.numColumns} gap-x-8`}
            >
              {rowMajor(labware.slots).map((slot) => (
                <LabwareComments
                  slot={slot}
                  value={addressToCommentMap.get(slot.address) ?? ""}
                  comments={comments}
                  layoutPlan={layoutPlan}
                  onCommentChange={(e) => {
                    send(
                      setCommentForAddress(slot.address, e.currentTarget.value)
                    );
                  }}
                />
              ))}
            </div>
          </div>
          <Label name={"All slots:"}>
            <Select
              onChange={(e) => send(setCommentForAll(e.currentTarget.value))}
            >
              <option />
              {optionValues(comments, "comment", "id")}
            </Select>
          </Label>
        </div>
      </div>

      <Modal show={current.matches("editingLayout")}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutMachine && <LayoutPlanner actor={layoutMachine} />}
        </ModalBody>
        <ModalFooter>
          <BlueButton
            onClick={() => layoutMachine.send(done())}
            className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
          >
            Done
          </BlueButton>
          <WhiteButton
            onClick={() => layoutMachine.send(cancel())}
            className="mt-3 w-full sm:mt-0 sm:ml-3"
          >
            Cancel
          </WhiteButton>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default SectioningConfirm;

interface SectioningConfirmProps {
  actor: SectioningConfirmActorRef;
}

export const SectioningConfirmTube: React.FC<SectioningConfirmProps> = ({
  actor,
}) => {
  const [current, send] = useActor<
    SectioningConfirmEvent,
    SectioningConfirmMachineType["state"]
  >(actor);

  const { labware, cancelled } = current.context;

  const rowClassnames = classNames(
    {
      "opacity-50 line-through": cancelled,
    },
    "cursor-pointer hover:opacity-90 text-sm tracking-wide"
  );

  return (
    <tr className={rowClassnames} onClick={() => send(toggleCancel())}>
      <TableCell>
        <span className="">{labware.barcode}</span>
      </TableCell>
      <TableCell>
        <RemoveIcon className="h-4 w-4 text-red-500" />
      </TableCell>
    </tr>
  );
};

interface LabwareCommentsProps {
  slot: LabwareLayoutFragment["slots"][number];
  layoutPlan: LayoutPlan;
  comments: Array<Comment>;
  value: string | number | undefined;
  onCommentChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const LabwareComments: React.FC<LabwareCommentsProps> = ({
  slot,
  layoutPlan,
  comments,
  value,
  onCommentChange,
}) => {
  return (
    <div className="flex flex-row items-center justify-start gap-x-2">
      <span className="font-medium text-gray-800 tracking-wide">
        {slot.address}
      </span>
      <span className="flex-grow text-center">
        {!layoutPlan.plannedActions.has(slot.address) && (
          <MutedText>Empty</MutedText>
        )}
        {layoutPlan.plannedActions.has(slot.address) && (
          <Select
            style={{ width: "100%" }}
            value={value}
            onChange={(e) => onCommentChange(e)}
          >
            <option value="" />
            {optionValues(comments, "comment", "id")}
          </Select>
        )}
      </span>
    </div>
  );
};
