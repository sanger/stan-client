import React from "react";
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
} from "../lib/machines/sectioning/sectioningOutcome/sectioningOutcomeEvents";
import LayoutPlanner from "./LayoutPlanner";
import { cancel, done } from "../lib/machines/layout/layoutEvents";
import { TableCell } from "./Table";
import RemoveIcon from "./icons/RemoveIcon";
import {
  SectioningOutcomeActorRef,
  SectioningOutcomeEvent,
  SectioningOutcomeMachineType,
} from "../lib/machines/sectioning/sectioningOutcome/sectioningOutcomeTypes";
import classNames from "classnames";
import MutedText from "./MutedText";
import Label from "./forms/Label";

interface SectioningConfirmProps {
  actor: SectioningOutcomeActorRef;
}

const SectioningConfirm: React.FC<SectioningConfirmProps> = ({ actor }) => {
  const [current, send] = useActor<
    SectioningOutcomeEvent,
    SectioningOutcomeMachineType["state"]
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
              className={`grid grid-cols-${labware.labwareType.numColumns} gap-x-8`}
            >
              {labware.slots.map((slot) => (
                <div className="flex flex-row items-center justify-start gap-x-2">
                  <span>{slot.address}</span>
                  <span className="flex-grow text-center">
                    {!layoutPlan.plannedActions.has(slot.address) && (
                      <MutedText>Empty</MutedText>
                    )}
                    {layoutPlan.plannedActions.has(slot.address) && (
                      <select
                        value={addressToCommentMap.get(slot.address) ?? ""}
                        onChange={(e) =>
                          send(
                            setCommentForAddress(
                              slot.address,
                              e.currentTarget.value
                            )
                          )
                        }
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
                      >
                        <option value="" />
                        {optionValues(comments, "comment", "id")}
                      </select>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Label name={"All slots:"}>
            <select
              onChange={(e) => send(setCommentForAll(e.currentTarget.value))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
            >
              <option />
              {optionValues(comments, "comment", "id")}
            </select>
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
          <button
            onClick={() => layoutMachine.send(cancel())}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default SectioningConfirm;

interface SectioningConfirmProps {
  actor: SectioningOutcomeActorRef;
}

export const SectioningConfirmTube: React.FC<SectioningConfirmProps> = ({
  actor,
}) => {
  const [current, send] = useActor<
    SectioningOutcomeEvent,
    SectioningOutcomeMachineType["state"]
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
