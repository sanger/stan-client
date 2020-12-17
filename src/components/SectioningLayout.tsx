import React from "react";
import PinkButton from "./buttons/PinkButton";
import { useActor } from "@xstate/react";
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
  createLabware,
  editLayout,
  updateSectioningLayout,
} from "../lib/machines/sectioning/sectioningLayout/sectioningLayoutEvents";
import { LabwareTypeName } from "../types/stan";
import LabelPrinter from "./LabelPrinter";
import Success from "./notifications/Success";
import LabelPrinterButton from "./LabelPrinterButton";
import { cancel, done } from "../lib/machines/layout/layoutEvents";
import {
  SectioningLayoutActorRef,
  SectioningLayoutEvent,
  SectioningLayoutMachineType,
} from "../lib/machines/sectioning/sectioningLayout/sectioningLayoutTypes";

interface SectioningLayoutProps {
  /**
   * {@link https://xstate.js.org/docs/guides/actors.html#spawning-machines Actor} to that will be passed into `useActor`.
   */
  actor: SectioningLayoutActorRef;

  /**
   * Callback to be called when deleting a SectioningLayout
   */
  onDelete: () => void;
}

const SectioningLayout = React.forwardRef<
  HTMLDivElement,
  SectioningLayoutProps
>(({ actor, onDelete }, ref) => {
  const [current, send] = useActor<
    SectioningLayoutEvent,
    SectioningLayoutMachineType["state"]
  >(actor);

  const {
    serverErrors,
    plannedLabware,
    plannedOperations,
    sectioningLayout,
    layoutPlan,
    labelPrinterRef,
    printSuccessMessage,
    printErrorMessage,
  } = current.context;

  const { layoutMachine } = current.children;

  return (
    <motion.div
      ref={ref}
      variants={variants.fadeInWithLift}
      initial={"hidden"}
      animate={"visible"}
      className="relative p-3 shadow"
    >
      <div className="md:grid md:grid-cols-2">
        <div className="py-4 flex flex-col items-center justify-between space-y-8">
          <Labware
            onClick={() => send(editLayout())}
            labware={sectioningLayout.destinationLabware}
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

          {current.matches("prep") && (
            <PinkButton onClick={() => send(editLayout())}>
              Edit Layout
            </PinkButton>
          )}
        </div>
        <div className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow">
          <div className="py-4 px-8 w-full space-y-4">
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

          {plannedLabware.length > 0 && (
            <div className="w-full space-y-4 py-4 px-8">
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
                        {current.matches("printing") && (
                          <LabelPrinterButton actor={lw.actorRef} />
                        )}
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

              {current.matches("printing") && labelPrinterRef && (
                <LabelPrinter actor={labelPrinterRef} />
              )}
            </div>
          )}

          {current.matches("prep") && (
            <div className="w-full py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
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
});

export default SectioningLayout;
