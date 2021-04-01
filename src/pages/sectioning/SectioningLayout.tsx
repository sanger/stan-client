import React from "react";
import labwareScanTableColumns from "../../components/labwareScanPanel/columns";
import PinkButton from "../../components/buttons/PinkButton";
import { useActor } from "@xstate/react";
import Label from "../../components/forms/Label";
import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
import BlueButton from "../../components/buttons/BlueButton";
import Heading from "../../components/Heading";
import LayoutPlanner from "../../components/LayoutPlanner";
import Labware from "../../components/labware/Labware";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Warning from "../../components/notifications/Warning";
import {
  createLabware,
  editLayout,
  updateSectioningLayout,
} from "../../lib/machines/sectioning/sectioningLayout/sectioningLayoutEvents";
import { LabwareTypeName, PrintableLabware } from "../../types/stan";
import LabelPrinter, { PrintResult } from "../../components/LabelPrinter";
import LabelPrinterButton from "../../components/LabelPrinterButton";
import { cancel, done } from "../../lib/machines/layout/layoutEvents";
import {
  SectioningLayoutActorRef,
  SectioningLayoutEvent,
  SectioningLayoutMachineType,
} from "../../lib/machines/sectioning/sectioningLayout/sectioningLayoutTypes";
import DataTable from "../../components/DataTable";
import { CellProps, Column, Row } from "react-table";
import { LabwareFieldsFragment } from "../../types/graphql";
import WhiteButton from "../../components/buttons/WhiteButton";
import { Input } from "../../components/forms/Input";
import { usePrinters } from "../../lib/hooks";
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from "./index";

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
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    printResult,
    currentPrinter,
  } = usePrinters();

  const {
    serverErrors,
    plannedLabware,
    plannedOperations,
    sectioningLayout,
    layoutPlan,
  } = current.context;

  const { layoutMachine } = current.children;

  // Special kind of column for displaying the sectioning numbers given from a planned operation
  const sectionsColumn: Column<LabwareFieldsFragment> = React.useMemo(() => {
    return {
      Header: "Section Number",
      id: "sections",
      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
        return plannedOperations.map((operation, j) => {
          const newSections = operation.planActions
            .filter(
              (action) => action.destination.labwareId === row.original.id
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
        });
      },
    };
  }, [plannedOperations]);

  // Special case column that renders a label printer button for each row
  const printColumn = {
    id: "printer",
    Header: "",
    Cell: (props: CellProps<PrintableLabware>) => (
      <LabelPrinterButton
        labwares={[props.row.original]}
        selectedPrinter={currentPrinter}
        onPrint={handleOnPrint}
        onPrintError={handleOnPrintError}
      />
    ),
  };

  const columns = [
    labwareScanTableColumns.barcode(),
    sectionsColumn,
    printColumn,
  ];

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
            onClick={() => send(editLayout())}
            name={sectioningLayout.destinationLabware.labwareType.name}
            slotText={(address) => buildSlotText(layoutPlan, address)}
            slotSecondaryText={(address) =>
              buildSlotSecondaryText(layoutPlan, address)
            }
            slotColor={(address) => buildSlotColor(layoutPlan, address)}
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
                <Input
                  disabled={
                    current.matches("printing") || current.matches("done")
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
                <Input
                  disabled={
                    current.matches("printing") || current.matches("done")
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
              <Input
                disabled={
                  current.matches("printing") || current.matches("done")
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
          <WhiteButton
            onClick={() => layoutMachine.send(cancel())}
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
