import React, { useEffect } from "react";
import labwareScanTableColumns from "../../components/labwareScanPanel/columns";
import PinkButton from "../../components/buttons/PinkButton";
import { useMachine } from "@xstate/react";
import Label from "../../components/forms/Label";
import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
import BlueButton from "../../components/buttons/BlueButton";
import Heading from "../../components/Heading";
import LayoutPlanner from "../../components/LayoutPlanner";
import Labware from "../../components/labware/Labware";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Warning from "../../components/notifications/Warning";
import { LabwareTypeName } from "../../types/stan";
import LabelPrinter, { PrintResult } from "../../components/LabelPrinter";
import LabelPrinterButton from "../../components/LabelPrinterButton";
import DataTable from "../../components/DataTable";
import { CellProps } from "react-table";
import { LabwareFieldsFragment, PlanMutation } from "../../types/sdk";
import WhiteButton from "../../components/buttons/WhiteButton";
import { Input } from "../../components/forms/Input";
import { usePrinters } from "../../lib/hooks";
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from "./index";
import {
  createSectioningLayoutMachine,
  SectioningLayout as SectioningLayoutModel,
} from "../../lib/machines/sectioning/sectioningLayout/sectioningLayoutMachine";

interface SectioningLayoutProps {
  /**
   * A sectioning layout
   */
  initialSectioningLayout: SectioningLayoutModel;

  /**
   * Callback for when planned labware is created
   */
  onCreate: (
    operations: PlanMutation["plan"]["operations"],
    labware: PlanMutation["plan"]["labware"]
  ) => void;

  /**
   * Callback to be called when deleting a SectioningLayout
   */
  onDelete: () => void;
}

const SectioningLayout = React.forwardRef<
  HTMLDivElement,
  SectioningLayoutProps
>(({ initialSectioningLayout, onCreate, onDelete }, ref) => {
  const [current, send, service] = useMachine(
    createSectioningLayoutMachine(initialSectioningLayout)
  );

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("done") || state.matches("printing")) {
        onCreate(state.context.plannedOperations, state.context.plannedLabware);
      }
    });

    return subscription.unsubscribe;
  }, [service, onCreate]);

  const {
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    printResult,
    currentPrinter,
  } = usePrinters();

  const {
    serverErrors,
    plannedLabware,
    sectioningLayout,
    layoutPlan,
  } = current.context;

  const { layoutMachine } = current.children;

  // Special case column that renders a label printer button for each row
  const printColumn = {
    id: "printer",
    Header: "",
    Cell: (props: CellProps<LabwareFieldsFragment>) => (
      <LabelPrinterButton
        labwares={[props.row.original]}
        selectedPrinter={currentPrinter}
        onPrint={handleOnPrint}
        onPrintError={handleOnPrintError}
      />
    ),
  };

  const columns = [labwareScanTableColumns.barcode(), printColumn];

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
            labware={sectioningLayout.destinationLabware}
            onClick={() => send({ type: "EDIT_LAYOUT" })}
            name={sectioningLayout.destinationLabware.labwareType.name}
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
                <Input
                  disabled={
                    current.matches("printing") || current.matches("done")
                  }
                  type="text"
                  value={sectioningLayout.barcode}
                  onChange={(e) =>
                    send({
                      type: "UPDATE_SECTIONING_LAYOUT",
                      sectioningLayout: {
                        barcode: e.currentTarget.value.trim(),
                      },
                    })
                  }
                />
              </Label>
            )}

            {sectioningLayout.destinationLabware.labwareType.name !==
              LabwareTypeName.VISIUM_LP && (
              <Label name={"Quantity"}>
                <Input
                  disabled={
                    current.matches("printing") || current.matches("done")
                  }
                  type="number"
                  min={1}
                  step={1}
                  value={sectioningLayout.quantity}
                  onChange={(e) =>
                    send({
                      type: "UPDATE_SECTIONING_LAYOUT",
                      sectioningLayout: {
                        quantity: Number(e.currentTarget.value),
                      },
                    })
                  }
                />
              </Label>
            )}

            <Label name={"Section Thickness"}>
              {/* When the section thickness is 0, input should be empty */}
              <Input
                disabled={
                  current.matches("printing") || current.matches("done")
                }
                type={"number"}
                min={1}
                step={1}
                value={
                  sectioningLayout.sectionThickness === 0
                    ? ""
                    : sectioningLayout.sectionThickness
                }
                onChange={(e) => {
                  send({
                    type: "UPDATE_SECTIONING_LAYOUT",
                    sectioningLayout: {
                      sectionThickness: Number(e.currentTarget.value),
                    },
                  });
                }}
              />
            </Label>
          </div>

          {plannedLabware.length > 0 && (
            <div className="w-full space-y-4 py-4 px-8">
              <DataTable columns={columns} data={plannedLabware} />

              {printResult && <PrintResult result={printResult} />}
            </div>
          )}

          {current.matches("printing") && (
            <div className="w-full border-t-2 border-gray-200 py-3 px-4 space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
              <LabelPrinter
                labwares={plannedLabware}
                showNotifications={false}
                onPrinterChange={handleOnPrinterChange}
                onPrint={handleOnPrint}
                onPrintError={handleOnPrintError}
              />
            </div>
          )}

          {current.matches("prep") && (
            <div className="w-full border-t-2 border-gray-200 py-3 px-4 sm:flex sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-100">
              <WhiteButton onClick={onDelete}>Delete Layout</WhiteButton>
              <BlueButton
                disabled={current.matches("prep.invalid")}
                onClick={() => send({ type: "CREATE_LABWARE" })}
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
          {layoutMachine && (
            <LayoutPlanner actor={layoutMachine}>
              <div className="my-2">
                <p className="text-gray-900 text-sm leading-normal">
                  To add sections to a slot, select a source for the buttons on
                  the right, and then click a destination slot. Multiple
                  sections may be added to a slot by clicking it multiple times.
                </p>

                <p className="mt-3 text-gray-900 text-sm leading-normal">
                  To remove all sections from a slot, first deselect any
                  selected sources by clicking on it, then select the
                  destination slot to empty it.
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
});

export default SectioningLayout;
