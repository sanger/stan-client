import React from "react";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import { State } from "xstate";
import {
  SectioningContext,
  SectioningEvents,
} from "../../lib/machines/sectioning";
import { backToPrep } from "../../lib/machines/sectioning/sectioningEvents";
import variants from "../../lib/motionVariants";
import {
  cancelEditLayout,
  doneEditLayout,
  editLayout,
} from "../../lib/machines/sectioning/sectioningLayout/sectioningLayoutEvents";
import BlueButton from "../../components/buttons/BlueButton";
import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
import Heading from "../../components/Heading";
import { motion } from "framer-motion";

interface OutcomesProps {
  current: State<
    SectioningContext,
    SectioningEvents,
    any,
    { value: any; context: SectioningContext }
  >;
  send: any;
}

const Outcomes: React.FC<OutcomesProps> = ({ current, send }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Summary</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <motion.div
          variants={variants.fadeInWithLift}
          initial={"hidden"}
          animate={"visible"}
          className="relative p-3 shadow"
        >
          <div className="md:grid md:grid-cols-2">
            <div className="py-4 flex flex-col items-center justify-between space-y-8">
              {/* Labware */}

              <PinkButton onClick={() => send(editLayout())}>
                Edit Layout
              </PinkButton>
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
                onClick={() => send(doneEditLayout())}
                className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
              >
                Done
              </BlueButton>
              <button
                onClick={() => send(cancelEditLayout())}
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </ModalFooter>
          </Modal>
        </motion.div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-row items-center justify-between">
            <PinkButton onClick={() => send(backToPrep())} action="tertiary">
              Back
            </PinkButton>
            <PinkButton action="primary">Save</PinkButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Outcomes;
