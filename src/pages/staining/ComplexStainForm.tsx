import React from "react";
import {
  ComplexStainRequest,
  LabwareFieldsFragment,
  RecordComplexStainMutation,
  StainPanel,
} from "../../types/sdk";
import { Form, Formik } from "formik";
import FormikInput from "../../components/forms/Input";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Heading from "../../components/Heading";
import MutedText from "../../components/MutedText";
import LabwareScanPanel from "../../components/labwareScanPanel/LabwareScanPanel";
import columns from "../../components/dataTable/labwareColumns";
import PinkButton from "../../components/buttons/PinkButton";
import * as Yup from "yup";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import { reload, stanCore } from "../../lib/sdk";
import FormikSelect from "../../components/forms/Select";
import { objectKeys } from "../../lib/helpers";
import { FormikLabwareScanner } from "../../components/labwareScanner/FormikLabwareScanner";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import WorkNumberSelect from "../../components/WorkNumberSelect";
import OperationCompleteModal from "../../components/modal/OperationCompleteModal";
import Warning from "../../components/notifications/Warning";
import WhiteButton from "../../components/buttons/WhiteButton";

type ComplexStainFormValues = ComplexStainRequest;

type ComplexStainFormProps = {
  stainType: string;
  initialLabware: LabwareFieldsFragment[];
  onLabwareChange: (labware: LabwareFieldsFragment[]) => void;
};

export default function ComplexStainForm({
  stainType,
  initialLabware,
  onLabwareChange,
}: ComplexStainFormProps) {
  const [current, send] = useMachine(
    createFormMachine<
      ComplexStainRequest,
      RecordComplexStainMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordComplexStain({ request: e.values });
        },
      },
    })
  );

  const { serverError } = current.context;

  const plexMin = 1;
  const plexMax = 100;

  const validationSchema = Yup.object().shape({
    stainType: Yup.string().required().label("Stain Type"),
    plex: Yup.number()
      .integer()
      .min(plexMin)
      .max(plexMax)
      .required()
      .label("Plex Number"),
    panel: Yup.string()
      .oneOf(Object.values(StainPanel))
      .required()
      .label("Experimental Panel"),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          barcode: Yup.string().required().label("Barcode"),
          bondBarcode: Yup.string().required().label("Bond Barcode"),
          bondRun: Yup.number().integer().positive().label("Bond Run"),
          workNumber: Yup.string().optional().label("SGP Number"),
        })
      )
      .min(1)
      .required()
      .label("Labware"),
  });

  return (
    <Formik<ComplexStainFormValues>
      initialValues={{
        stainType,
        plex: 1,
        panel: StainPanel.Marker,
        labware: initialLabware.map(buildLabware),
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        send({ type: "SUBMIT_FORM", values });
      }}
    >
      {({ values, resetForm }) => (
        <Form>
          <FormikInput label={""} name={"stainType"} type={"hidden"} />

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
                  Please scan in the slides you wish to stain.
                </MutedText>

                <FormikLabwareScanner
                  initialLabwares={initialLabware}
                  onChange={onLabwareChange}
                  buildLabware={buildLabware}
                  locked={current.matches("submitted")}
                >
                  <LabwareScanPanel
                    columns={[
                      columns.barcode(),
                      columns.donorId(),
                      columns.labwareType(),
                      columns.externalName(),
                    ]}
                  />
                </FormikLabwareScanner>
              </motion.div>

              <motion.div
                variants={variants.fadeInWithLift}
                className="space-y-4"
              >
                <Heading level={3}>Stain Information</Heading>

                <FormikInput
                  label={"Plex Number"}
                  name={"plex"}
                  type={"number"}
                  min={plexMin}
                  max={plexMax}
                  step={1}
                />

                <FormikSelect label={"Experimental Panel"} name={"panel"}>
                  {objectKeys(StainPanel).map((stainPanel) => (
                    <option key={stainPanel} value={StainPanel[stainPanel]}>
                      {stainPanel}
                    </option>
                  ))}
                </FormikSelect>
              </motion.div>

              {values.labware.length > 0 && (
                <motion.div
                  variants={variants.fadeInWithLift}
                  className="space-y-4"
                >
                  <Heading level={3}>Bond Run Information</Heading>

                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeader>Slide Barcode</TableHeader>
                        <TableHeader>Bond Barcode</TableHeader>
                        <TableHeader>Bond Run Number</TableHeader>
                        <TableHeader>SGP Number</TableHeader>
                      </tr>
                    </TableHead>

                    <TableBody>
                      {values.labware.map((lw, i) => (
                        <tr key={lw.barcode}>
                          <TableCell>{lw.barcode}</TableCell>
                          <TableCell>
                            <FormikInput
                              label={""}
                              name={`labware.${i}.bondBarcode`}
                            />
                          </TableCell>
                          <TableCell>
                            <FormikInput
                              label={""}
                              name={`labware.${i}.bondRun`}
                              type={"number"}
                            />
                          </TableCell>
                          <TableCell>
                            <WorkNumberSelect
                              label={""}
                              name={`labware.${i}.workNumber`}
                            />
                          </TableCell>
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </motion.div>

            <Sidebar>
              <Heading level={3} showBorder={false}>
                Summary
              </Heading>

              {values.labware.length > 0 && (
                <p>
                  <span className="font-semibold">{values.labware.length}</span>{" "}
                  piece(s) of labware will be stained using{" "}
                  <span className="font-semibold">{values.stainType}</span>.
                </p>
              )}

              <PinkButton
                disabled={current.matches("submitted")}
                loading={current.matches("submitting")}
                type="submit"
                className="sm:w-full"
              >
                Submit
              </PinkButton>
            </Sidebar>
          </GrayBox>
          <OperationCompleteModal
            show={current.matches("submitted")}
            message={"Staining Successful"}
            additionalButtons={
              <WhiteButton
                type="button"
                style={{ marginRight: "auto" }}
                className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  resetForm();
                  send({ type: "RESET" });
                }}
              >
                Stain Again
              </WhiteButton>
            }
            onReset={reload}
          >
            <p>
              If you wish to start the process again, click the "Reset Form"
              button. Otherwise you can return to the Home screen.
            </p>
          </OperationCompleteModal>
        </Form>
      )}
    </Formik>
  );
}

function buildLabware(labware: LabwareFieldsFragment) {
  return {
    barcode: labware.barcode,
    bondBarcode: "",
    bondRun: 0,
    workNumber: undefined,
  };
}
