import React, { useContext, useMemo } from "react";
import AppShell from "../components/AppShell";
import { Form, Formik } from "formik";
import {
  DestroyMutation,
  DestroyRequest,
  GetDestroyInfoQuery,
} from "../types/sdk";
import * as Yup from "yup";
import { useMachine } from "@xstate/react";
import GrayBox, { Sidebar } from "../components/layouts/GrayBox";
import { motion } from "framer-motion";
import variants from "../lib/motionVariants";
import Warning from "../components/notifications/Warning";
import Heading from "../components/Heading";
import MutedText from "../components/MutedText";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareScanPanel from "../components/labwareScanPanel/LabwareScanPanel";
import columns from "../components/dataTable/labwareColumns";
import { FormikErrorMessage, optionValues } from "../components/forms";
import FormikSelect from "../components/forms/Select";
import PinkButton from "../components/buttons/PinkButton";
import createFormMachine from "../lib/machines/form/formMachine";
import { reload, StanCoreContext } from "../lib/sdk";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";

const initialValues: DestroyRequest = {
  barcodes: [],
  reasonId: -1,
};

function buildValidationSchema(
  destroyInfo: GetDestroyInfoQuery
): Yup.ObjectSchema {
  const destructionReasonIds = destroyInfo.destructionReasons.map(
    (dr) => dr.id
  );
  return Yup.object().shape({
    barcodes: Yup.array()
      .label("Labware")
      .min(1, "Please scan in at least 1 labware")
      .of(Yup.string().required()),
    reasonId: Yup.number()
      .required()
      .oneOf(destructionReasonIds, "Please choose a reason")
      .label("Reason"),
  });
}

interface PageParams {
  destroyInfo: GetDestroyInfoQuery;
}

const Destroy: React.FC<PageParams> = ({ destroyInfo }) => {
  const stanCore = useContext(StanCoreContext);
  const [current, send] = useMachine(() =>
    createFormMachine<DestroyRequest, DestroyMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.Destroy({ request: e.values });
        },
      },
    })
  );

  const validationSchema = useMemo(() => buildValidationSchema(destroyInfo), [
    destroyInfo,
  ]);

  const submitForm = async (values: DestroyRequest) =>
    send({ type: "SUBMIT_FORM", values });
  const serverError = current.context.serverError;
  const formLocked = !current.matches("fillingOutForm");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Destroy Labware</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitForm}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <GrayBox>
                  <motion.div
                    variants={variants.fadeInParent}
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"hidden"}
                    className="md:w-2/3 space-y-10"
                  >
                    {serverError && <Warning error={serverError} />}

                    <motion.div
                      variants={variants.fadeInWithLift}
                      className="space-y-4"
                    >
                      <Heading level={3}>Labware</Heading>
                      <MutedText>
                        Please scan in the labware you wish to destroy.
                      </MutedText>

                      <LabwareScanner
                        onChange={(labwares) =>
                          setFieldValue(
                            "barcodes",
                            labwares.map((lw) => lw.barcode)
                          )
                        }
                        locked={formLocked}
                      >
                        <LabwareScanPanel
                          columns={[
                            columns.barcode(),
                            columns.donorId(),
                            columns.labwareType(),
                            columns.externalName(),
                          ]}
                        />
                      </LabwareScanner>
                      <FormikErrorMessage name={"barcodes"} />
                    </motion.div>

                    <motion.div
                      variants={variants.fadeInWithLift}
                      className="space-y-4"
                    >
                      <Heading level={3}>Reason</Heading>
                      <MutedText>
                        Please select the reason for destruction.
                      </MutedText>

                      <FormikSelect
                        disabled={formLocked}
                        label={"Reason"}
                        name={"reasonId"}
                        emptyOption
                      >
                        {optionValues(
                          destroyInfo.destructionReasons,
                          "text",
                          "id"
                        )}
                      </FormikSelect>
                    </motion.div>
                  </motion.div>

                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {values.barcodes.length > 0 ? (
                      <p>
                        <span className="font-semibold">
                          {values.barcodes.length}
                        </span>{" "}
                        piece(s) of labware will be destroyed.
                      </p>
                    ) : (
                      <p className="italic text-sm">No labwares scanned.</p>
                    )}

                    <PinkButton
                      disabled={formLocked}
                      type="submit"
                      className="sm:w-full"
                    >
                      Destroy Labware
                    </PinkButton>
                  </Sidebar>
                </GrayBox>

                <OperationCompleteModal
                  show={current.matches("submitted")}
                  message={"Labware(s) Destroyed"}
                  onReset={reload}
                >
                  <p>
                    If you wish to start the process again, click the "Reset
                    Form" button. Otherwise you can return to the Home screen.
                  </p>
                </OperationCompleteModal>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Destroy;
