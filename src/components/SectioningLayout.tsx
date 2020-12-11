import React from "react";
import { Actor } from "xstate";
import PinkButton from "./buttons/PinkButton";
import { useActor } from "@xstate/react";
import { SectioningLayoutMachineType } from "../lib/machines/sectioning/sectioningLayout/sectioningLayoutMachine";
import Label from "./forms/Label";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import BlueButton from "./buttons/BlueButton";
import Heading from "./Heading";
import LayoutPlanner from "./LayoutPlanner";
import Labware from "./Labware";
import { motion } from "framer-motion";
import variants from "../lib/motionVariants";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "./Table";
import Warning from "./notifications/Warning";
import {
  cancelEditLayout,
  createLabware,
  doneEditLayout,
  editLayout,
  SectioningLayoutEvents,
  updateSectioningLayout,
} from "../lib/machines/sectioning/sectioningLayout/sectioningLayoutEvents";
import { LabwareTypeName } from "../types/stan";
import { createAddress } from "../lib/helpers/labwareHelper";
import LabelPrinter from "./LabelPrinter";
import Success from "./notifications/Success";
import LabelPrinterButton from "./LabelPrinterButton";

interface SectioningLayoutProps {
  /**
   * {@link https://xstate.js.org/docs/guides/actors.html#spawning-machines Actor} to that will be passed into `useActor`.
   */
  actor: Actor<any, any>;

  /**
   * Callback to be called when deleting a SectioningLayout
   */
  onDelete: () => void;
}

const SectioningLayout: React.FC<SectioningLayoutProps> = ({
  actor,
  onDelete,
}) => {
  const [current, send] = useActor<
    SectioningLayoutEvents,
    SectioningLayoutMachineType["state"]
  >(actor);
  const {
    serverErrors,
    plannedLabware,
    plannedOperations,
    sectioningLayout,
    layoutPlan,
    layoutPlanRef,
    labelPrinterRef,
    printSuccessMessage,
    printErrorMessage,
  } = current.context;

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
            sampleColors={layoutPlan.sampleColors}
            onClick={() => send(editLayout())}
            labware={sectioningLayout.destinationLabware}
            actions={layoutPlan.plannedActions}
          />

          {current.matches("prep") && (
            <PinkButton onClick={() => send(editLayout())}>
              Edit Layout
            </PinkButton>
          )}
        </div>
        <div className="p-4 flex flex-col items-center justify-between space-y-4 bg-gray-100">
          <div className="w-full space-y-4">
            {current.matches("prep.error") && (
              <Warning
                message={
                  serverErrors?.message ??
                  "There was an error creating the Labware"
                }
              >
                <ul className="list-disc list-inside">
                  {serverErrors?.problems.map((problem, index) => {
                    return <li key={index}>{problem}</li>;
                  })}
                </ul>
              </Warning>
            )}

            {sectioningLayout.destinationLabware.labwareType.name ===
              LabwareTypeName.VISIUM_LP && (
              <Label name={"Barcode"}>
                <input
                  disabled={!current.matches("prep")}
                  className={
                    "mt-1 focus:ring-sdb-100 focus:border-sdb-100 block w-full md:w-2/3 border-gray-300 rounded-md disabled:opacity-75 disabled:text-gray-600"
                  }
                  type="text"
                  value={sectioningLayout.barcode}
                  onChange={(e) =>
                    send(
                      updateSectioningLayout({
                        barcode: e.currentTarget.value.trim(),
                      })
                    )
                  }
                />
              </Label>
            )}

            {sectioningLayout.destinationLabware.labwareType.name !==
              LabwareTypeName.VISIUM_LP && (
              <Label name={"Quantity"}>
                <input
                  disabled={!current.matches("prep")}
                  className={
                    "mt-1 focus:ring-sdb-100 focus:border-sdb-100 block w-full md:w-2/3 border-gray-300 rounded-md disabled:opacity-75 disabled:text-gray-600"
                  }
                  type="number"
                  min={1}
                  step={1}
                  value={sectioningLayout.quantity}
                  onChange={(e) =>
                    send(
                      updateSectioningLayout({
                        quantity: Number(e.currentTarget.value),
                      })
                    )
                  }
                />
              </Label>
            )}

            <Label name={"Section Thickness"}>
              <input
                disabled={!current.matches("prep")}
                className={
                  "mt-1 focus:ring-sdb-100 focus:border-sdb-100 block w-full md:w-2/3 border-gray-300 rounded-md disabled:opacity-75 disabled:text-gray-600"
                }
                type={"number"}
                min={1}
                step={1}
                value={sectioningLayout.sectionThickness}
                onChange={(e) => {
                  send(
                    updateSectioningLayout({
                      sectionThickness: Number(e.currentTarget.value),
                    })
                  );
                }}
              />
            </Label>
          </div>

          {current.matches("printing") && (
            <div className="w-full space-y-4">
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Barcode</TableHeader>
                    <TableHeader>Section Number</TableHeader>
                    <TableHeader />
                  </tr>
                </TableHead>
                <TableBody>
                  {plannedLabware.map((lw, i) => (
                    <tr key={i}>
                      <TableCell>{lw.barcode}</TableCell>
                      <TableCell>
                        {plannedOperations.map((operation, j) => {
                          const newSections = operation.planActions
                            .filter(
                              (action) => action.destination.labwareId === lw.id
                            )
                            .map((action, i) => {
                              return (
                                <li key={i} className="text-sm">
                                  <span className="font-semibold">
                                    {action.destination.address}
                                  </span>{" "}
                                  <span className="">{action.newSection}</span>
                                </li>
                              );
                            });

                          return <ul key={j}>{newSections}</ul>;
                        })}
                      </TableCell>
                      <TableCell>
                        <LabelPrinterButton actor={lw.actorRef} />
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>

              {current.matches({ printing: "printSuccess" }) && (
                <Success message={printSuccessMessage} />
              )}

              {current.matches({ printing: "printError" }) && (
                <Warning message={printErrorMessage} />
              )}

              {labelPrinterRef && <LabelPrinter actor={labelPrinterRef} />}
            </div>
          )}

          {current.matches("prep") && (
            <div className="w-full sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onDelete}
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete Layout
              </button>
              <BlueButton
                disabled={current.matches("prep.invalid")}
                onClick={() => send(createLabware())}
              >
                Create Labware
              </BlueButton>
            </div>
          )}
        </div>
      </div>

      <Modal show={current.matches("editingLayout")}>
        <ModalBody>
          <Heading level={3}>Set Layout</Heading>
          {layoutPlanRef && <LayoutPlanner actor={layoutPlanRef} />}
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
  );
};

export default SectioningLayout;
