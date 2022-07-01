import React from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareScanTable from "../components/labwareScanPanel/LabwareScanPanel";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import BlueButton from "../components/buttons/BlueButton";
import PasteRestrictedBox from "../components/PasteRestrictedBox"
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import { FormikErrorMessage } from "../components/forms";
import Warning from "../components/notifications/Warning";
import { motion } from "framer-motion";
import variants from "../lib/motionVariants";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import { stanCore, reload } from "../lib/sdk";
import {
  AddExternalIdMutation,
  AddExternalIdRequest,
} from "../types/sdk";

export default function AddExternalID() {
  type AddExternalIDFormData = Required<AddExternalIdRequest>

  const [current, send] = useMachine(
    createFormMachine<AddExternalIdRequest, AddExternalIdMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          console.log("getting called " + e.type);
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.AddExternalID({request: e.values});
        },
      },
    })
  );

  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      labwareBarcode: Yup.string().required("A labware must be scanned in"),
      externalName: Yup.string().required("External Identifier is a required field").min(1),
    });
  }

  const formLocked = !current.matches("fillingOutForm");
  const serverError = current.context.serverError;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Add External ID</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<AddExternalIDFormData>
            initialValues={{
              externalName: "",
              labwareBarcode: "",
            }}
            onSubmit={async (values) => {
              send({
                type: "SUBMIT_FORM",
                values
              });
            }}
            validationSchema={buildValidationSchema()}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <motion.div
                  variants={variants.fadeInWithLift}
                  className="space-y-4"
                >
                  {serverError && <Warning error={serverError} />}
                  <Heading level={2}>Labware</Heading>
                  <LabwareScanner
                    limit={1}
                    onAdd={(labware) => {
                      setFieldValue(
                        "labwareBarcode",
                        labware.barcode
                      );
                    }}
                    onRemove={() => {
                      setFieldValue("labwareBarcode", "");
                    }}
                  >
                    {values.labwareBarcode.length === 0 && (
                      <FormikErrorMessage name={"labware"} />
                    )}
                    <motion.div variants={variants.fadeInWithLift}>
                      <LabwareScanTable
                        columns={[
                          labwareScanTableColumns.barcode(),
                          labwareScanTableColumns.donorId(),
                          labwareScanTableColumns.tissueType(),
                          labwareScanTableColumns.spatialLocation(),
                          labwareScanTableColumns.replicate(),
                          labwareScanTableColumns.labwareType(),
                          labwareScanTableColumns.fixative(),
                          labwareScanTableColumns.medium()
                        ]}
                      />
                    </motion.div>
                    <FormikErrorMessage name={"labwareBarcode"} />
                  </LabwareScanner>
                  <Heading level={2}>External ID</Heading>
                  <motion.div>
                    <PasteRestrictedBox
                      onChange={(externalName) => { 
                        setFieldValue(
                          "externalName",
                          externalName
                        );
                      }}
                    />
                    <FormikErrorMessage name={"externalName"} />
                  </motion.div>
                </motion.div>
                <OperationCompleteModal
                  show={current.matches("submitted")}
                  message={"Operation Complete"}
                  onReset={reload}
                >
                  <p>
                    If you wish to start the process again, click the "Reset
                    Form" button. Otherwise you can return to the Home screen.
                  </p>
                </OperationCompleteModal>
                <div className="my-4 mx-4 p-4 rounded-md bg-gray-100">
                  <p className="my-3 text-gray-800 text-sm text-center">
                    Once a labware has been scanned in and a valid external id is given, click save 
                    to record the external id on the sample
                  </p>
                  <div className="flex flex-row items-center justify-center gap-4">
                    <BlueButton
                      id="save"
                      disabled={formLocked}
                      className="whitespace-nowrap"
                      action={"primary"}
                      type="submit"
                    >
                      Save
                    </BlueButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}