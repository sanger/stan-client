import React from "react";
import { useActor } from "@xstate/react";
import variants from "../../lib/motionVariants";
import Labware from "../../components/Labware";
import PinkButton from "../../components/buttons/PinkButton";
import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
import Heading from "../../components/Heading";
import BlueButton from "../../components/buttons/BlueButton";
import { motion } from "framer-motion";
import { optionValues } from "../../components/forms";
import {
  editLayout,
  setCommentForAddress,
  setCommentForAll,
} from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmEvents";
import LayoutPlanner from "../../components/LayoutPlanner";
import { cancel, done } from "../../lib/machines/layout/layoutEvents";
import {
  SectioningConfirmActorRef,
  SectioningConfirmEvent,
  SectioningConfirmMachineType,
} from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";
import Label from "../../components/forms/Label";
import WhiteButton from "../../components/buttons/WhiteButton";
import { rowMajor } from "../../lib/helpers/labwareHelper";
import { Select } from "../../components/forms/Select";
import LabwareComments from "./LabwareComments";

interface ConfirmLabwareProps {
  actor: SectioningConfirmActorRef;
}

const ConfirmLabware: React.FC<ConfirmLabwareProps> = ({ actor }) => {
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

          <PinkButton
            disabled={current.matches("done")}
            onClick={() => send(editLayout())}
          >
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
                  disabled={current.matches("done")}
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
              disabled={current.matches("done")}
              onChange={(e) => send(setCommentForAll(e.currentTarget.value))}
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

export default ConfirmLabware;
