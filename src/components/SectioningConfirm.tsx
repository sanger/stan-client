import React from "react";
import { ActorRef } from "xstate";
import {
  SectioningOutcomeEvents,
  SectioningOutcomeMachineType,
} from "../lib/machines/sectioning/sectioningOutcome";
import { useActor } from "@xstate/react";
import variants from "../lib/motionVariants";
import Labware from "./Labware";
import PinkButton from "./buttons/PinkButton";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import Heading from "./Heading";
import BlueButton from "./buttons/BlueButton";
import { motion } from "framer-motion";

interface SectioningConfirmProps {
  actor: ActorRef<
    SectioningOutcomeEvents,
    SectioningOutcomeMachineType["state"]
  >;
}

const SectioningConfirm: React.FC<SectioningConfirmProps> = ({ actor }) => {
  const [current, send] = useActor<
    SectioningOutcomeEvents,
    SectioningOutcomeMachineType["state"]
  >(actor);

  const { layoutPlan, labware } = current.context;

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
            // onClick={() => send(editLayout())}
            labware={labware}
            slotText={(slot) =>
              layoutPlan.plannedActions.get(slot.address)?.labware.barcode
            }
            slotColor={(slot) => {
              const action = layoutPlan.plannedActions.get(slot.address);
              if (action) {
                return layoutPlan.sampleColors.get(action.sampleId);
              }
              return undefined;
            }}
          />

          <PinkButton>Edit Layout</PinkButton>
        </div>
        <div className="p-4 flex flex-col items-center justify-between space-y-4 bg-gray-100">
          <div className="w-full space-y-4">{/* Table goes here */}</div>
        </div>
      </div>

      <Modal show={current.matches("editingLayout")}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {/*{layoutPlanRef && <LayoutPlanner actor={layoutPlanRef} />}*/}
        </ModalBody>
        <ModalFooter>
          <BlueButton
            // onClick={() => send(doneEditLayout())}
            className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
          >
            Done
          </BlueButton>
          <button
            // onClick={() => send(cancelEditLayout())}
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
