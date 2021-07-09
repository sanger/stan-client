import React, { useContext, useEffect } from "react";
import labwareScanTableColumns from "../dataTable/labwareColumns";
import PinkButton from "../buttons/PinkButton";
import { useMachine } from "@xstate/react";
import Modal, { ModalBody, ModalFooter } from "../Modal";
import BlueButton from "../buttons/BlueButton";
import Heading from "../Heading";
import LayoutPlanner from "../LayoutPlanner";
import Labware from "../labware/Labware";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Warning from "../notifications/Warning";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import LabelPrinter, { PrintResult } from "../LabelPrinter";
import LabelPrinterButton from "../LabelPrinterButton";
import DataTable from "../DataTable";
import { CellProps } from "react-table";
import {
  LabwareFieldsFragment,
  LabwareType,
  PlanResult,
} from "../../types/sdk";
import WhiteButton from "../buttons/WhiteButton";
import FormikInput from "../forms/Input";
import { usePrinters } from "../../lib/hooks";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import { createLabwarePlanMachine } from "./labwarePlan.machine";
import {
  buildSlotColor,
  buildSlotSecondaryText,
  buildSlotText,
} from "../../pages/sectioning/index";
import { PlannerContext } from "./Planner";

type LabwarePlanProps = {
  /**
   * Since PlanRequests have no identity, a client ID must be provided
   */
  cid: string;

  /**
   * The labware to plan onto
   */
  outputLabware: NewLabwareLayout;

  /**
   * Callback triggered when the delete button is clicked
   * @param cid the client ID of the {@link LabwarePlan}
   */
  onDeleteButtonClick: (cid: string) => void;

  /**
   * Callback triggered once the plan has been successfully created
   * @param cid the client ID of the {@link LabwarePlan}
   * @param planResult the created plan
   */
  onComplete: (cid: string, planResult: PlanResult) => void;
};

const LabwarePlan = React.forwardRef<HTMLDivElement, LabwarePlanProps>(
  ({ cid, outputLabware, onDeleteButtonClick, onComplete }, ref) => {
    const ctx = useContext(PlannerContext)!;
    const [current, send, service] = useMachine(
      createLabwarePlanMachine({
        sources: [],
        sampleColors: ctx.sampleColors,
        destinationLabware: outputLabware,
        plannedActions: new Map(),
      })
    );

    useEffect(() => {
      const subscription = service.subscribe((state) => {
        if (state.matches("done") || state.matches("printing")) {
          onComplete(cid, state.context.plan!);
        }
      });

      return subscription.unsubscribe;
    }, [service, onComplete]);

    const formValidationSchema = buildValidator(outputLabware.labwareType);

    const {
      handleOnPrint,
      handleOnPrintError,
      handleOnPrinterChange,
      printResult,
      currentPrinter,
    } = usePrinters();

    const { serverErrors, layoutPlan, plan } = current.context;

    const plannedLabware = plan?.labware ?? [];

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
        <Formik
          onSubmit={() => {}}
          initialValues={{}}
          validationSchema={formValidationSchema}
          className="md:grid md:grid-cols-2"
        >
          <div className="py-4 flex flex-col items-center justify-between space-y-8">
            <Labware
              labware={outputLabware}
              onClick={() => send({ type: "EDIT_LAYOUT" })}
              name={outputLabware.labwareType.name}
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
          <Form className="border border-gray-300 rounded-md flex flex-col items-center justify-between space-y-4 shadow">
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

              <FormikInput
                label={""}
                type={"hidden"}
                name={"operationType"}
                value={ctx.operationType}
              />

              {outputLabware.labwareType.name === LabwareTypeName.VISIUM_LP && (
                <FormikInput
                  name={"barcode"}
                  label={"Barcode"}
                  type={"text"}
                  disabled={
                    current.matches("printing") || current.matches("done")
                  }
                />
              )}

              {outputLabware.labwareType.name !== LabwareTypeName.VISIUM_LP && (
                <FormikInput
                  name={"Quantity"}
                  label={"quantity"}
                  type={"number"}
                  min={1}
                  step={1}
                  disabled={
                    current.matches("printing") || current.matches("done")
                  }
                />
              )}

              {/* When the section thickness is 0, input should be empty */}
              <FormikInput
                disabled={
                  current.matches("printing") || current.matches("done")
                }
                label={"Section Thickness"}
                name={"sectionThickness"}
                type={"number"}
                min={1}
                step={1}
                // value={
                //   sectioningLayout.sectionThickness === 0
                //     ? ""
                //     : sectioningLayout.sectionThickness
                // }
              />
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
                <WhiteButton onClick={() => onDeleteButtonClick(cid)}>
                  Delete Layout
                </WhiteButton>
                <BlueButton
                  type="submit"
                  disabled={current.matches("prep.invalid")}
                >
                  Create Labware
                </BlueButton>
              </div>
            )}
          </Form>
        </Formik>

        <Modal show={current.matches("editingLayout")}>
          <ModalBody>
            <Heading level={3}>Set Layout</Heading>
            {layoutMachine && (
              <LayoutPlanner actor={layoutMachine}>
                <div className="my-2">
                  <p className="text-gray-900 text-sm leading-normal">
                    To add sections to a slot, select a source for the buttons
                    on the right, and then click a destination slot. Clicking a
                    filled slot will empty it.
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
  }
);

export default LabwarePlan;

/**
 * Builds a yup validator for the labware plan form
 * @param labwareType the labware type of the labware plan
 */
function buildValidator(labwareType: LabwareType): Yup.ObjectSchema {
  let formShape = {
    quantity: Yup.number().required().integer().min(1).max(99),
    sectionThickness: Yup.number().required().integer().min(1),
    layoutPlan: Yup.mixed()
      .test("layoutPlan", "LayoutPlan is invalid", (value) => {
        return value.plannedActions.size > 0;
      })
      .defined(),
  };

  let sectioningLayout: Yup.ObjectSchema;

  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    sectioningLayout = Yup.object()
      .shape({ barcode: Yup.string().required().min(14), ...formShape })
      .defined();
  } else {
    sectioningLayout = Yup.object().shape(formShape).defined();
  }

  return Yup.object()
    .shape({
      sectioningLayout,
    })
    .defined();
}
