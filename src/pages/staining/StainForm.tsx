import React, { useMemo } from "react";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import {
  GetStainInfoQuery,
  LabwareFieldsFragment,
  StainMutation,
  StainRequest,
} from "../../types/sdk";
import { reload, stanCore } from "../../lib/sdk";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Warning from "../../components/notifications/Warning";
import Heading from "../../components/Heading";
import WorkNumberSelect from "../../components/WorkNumberSelect";
import { FormikErrorMessage } from "../../components/forms";
import MutedText from "../../components/MutedText";
import LabwareScanner from "../../components/labwareScanner/LabwareScanner";
import LabwareScanPanel from "../../components/labwareScanPanel/LabwareScanPanel";
import columns from "../../components/dataTable/labwareColumns";
import FormikInput from "../../components/forms/Input";
import PinkButton from "../../components/buttons/PinkButton";
import OperationCompleteModal from "../../components/modal/OperationCompleteModal";

/**
 * Type used for the values in the form.
 *
 * Varies slightly from {@link StainRequest} as the form will show minutes and seconds (i.e. the {@code _minutes}
 * and {@code _seconds} properties) for the duration. These are used to update {@code seconds} when changed.
 */
type StainFormValues = Omit<StainRequest, "timeMeasurements"> & {
  timeMeasurements: Array<{
    /**
     * The name of the measurement
     */
    name: string;

    /**
     * The minutes value displayed and updated by the user
     */
    _minutes: number;

    /**
     * The seconds value displayed and updated by the user
     */
    _seconds: number;

    /**
     * The seconds calculated from the {@code _minutes} and {@code _seconds} values that will be sent as part of the
     * {@link StainRequest} to core
     */
    seconds: number;
  }>;
};

type StainFormProps = {
  stainType: string;
  stainingInfo: GetStainInfoQuery;
  initialLabware: LabwareFieldsFragment[];
  onLabwareChange: (labware: LabwareFieldsFragment[]) => void;
};

export default function StainForm({
  stainType,
  stainingInfo,
  initialLabware,
  onLabwareChange,
}: StainFormProps) {
  const formMachine = React.useMemo(() => {
    return createFormMachine<StainRequest, StainMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.Stain({ request: e.values });
        },
      },
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  const { serverError } = current.context;

  /**
   * Map of stain type name to list of its measurements.
   * Helpful for the form to only display measurement inputs when selected stain type has some
   */
  const stainTypeMap: Map<string, Array<string>> = useMemo(() => {
    return stainingInfo.stainTypes.reduce<Map<string, Array<string>>>(
      (memo, st) => {
        memo.set(st.name, st.measurementTypes);
        return memo;
      },
      new Map()
    );
  }, [stainingInfo]);

  /**
   * Validation schema for the staining form
   */
  const validationSchema = Yup.object().shape({
    barcodes: Yup.array()
      .of(Yup.string().required())
      .min(1)
      .required()
      .label("Labware"),
    stainType: Yup.string()
      .oneOf(Array.from(stainTypeMap.keys()))
      .required()
      .label("Stain Type"),
    timeMeasurements: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required().label("Name"),
        seconds: Yup.number().integer().min(1).required().label("Duration"),
      })
    ),
    workNumber: Yup.string().required().label("SGP Number"),
  });

  /**
   * Initial values of the staining form
   */
  const timeMeasurements = stainTypeMap.get(stainType) ?? [];

  return (
    <Formik<StainFormValues>
      initialValues={{
        barcodes: initialLabware.map((lw) => lw.barcode),
        stainType,
        timeMeasurements: timeMeasurements.map((name) => ({
          name,
          _minutes: 0,
          _seconds: 0,
          seconds: 0,
        })),
        workNumber: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        // Convert the StainForm into a StainRequest (i.e. remove _minutes and _seconds)
        const stainRequest: StainRequest = {
          ...values,
          timeMeasurements: values.timeMeasurements.map((tm) => ({
            name: tm.name,
            seconds: tm.seconds,
          })),
        };

        send({ type: "SUBMIT_FORM", values: stainRequest });
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <FormikInput
            label={""}
            name={"stainType"}
            type={"hidden"}
            value={stainType}
          />
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
                <Heading level={3}>SGP Number</Heading>

                <WorkNumberSelect
                  name={"workNumber"}
                  onWorkNumberChange={(workNumber) =>
                    setFieldValue("workNumber", workNumber)
                  }
                />
              </motion.div>

              <motion.div
                variants={variants.fadeInWithLift}
                className="space-y-4"
              >
                <Heading level={3}>Labware</Heading>
                <MutedText>
                  Please scan in the slides you wish to stain.
                </MutedText>

                <LabwareScanner
                  initialLabwares={initialLabware}
                  onChange={(labwares) => {
                    setFieldValue(
                      "barcodes",
                      labwares.map((lw) => lw.barcode)
                    );
                    onLabwareChange(labwares);
                  }}
                  locked={current.matches("submitted")}
                >
                  <LabwareScanPanel
                    columns={[
                      columns.barcode(),
                      columns.donorId(),
                      columns.labwareType(),
                      columns.externalName(),
                      columns.bioState(),
                    ]}
                  />
                </LabwareScanner>
                <FormikErrorMessage name={"barcodes"} />
              </motion.div>

              {values.timeMeasurements.length > 0 && (
                <motion.div
                  variants={variants.fadeInWithLift}
                  className={"space-y-4"}
                >
                  <Heading level={4}>Measurements</Heading>

                  <MutedText>
                    Please enter the incubation time for each agent.
                  </MutedText>

                  <div className="sm:flex sm:flex-row items-top justify-start sm:space-x-12">
                    {values.timeMeasurements.map((measurementType, i) => (
                      <div key={measurementType.name}>
                        <span className="text-sm text-gray-800 font-medium">
                          {measurementType.name}
                        </span>

                        <FormikInput
                          label={""}
                          name={`timeMeasurements.${i}.name`}
                          value={measurementType.name}
                          type="hidden"
                        />

                        <div className="flex flex-row items-center justify-between space-x-2">
                          <FormikInput
                            label={""}
                            name={`timeMeasurements.${i}._minutes`}
                            type="number"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              // Update the minutes for this timeMeasurement
                              setFieldValue(
                                `timeMeasurements.${i}._minutes`,
                                Number(e.target.value)
                              );

                              // Update the total seconds for this measurement
                              setFieldValue(
                                `timeMeasurements.${i}.seconds`,
                                Number(e.target.value) * 60 +
                                  measurementType._seconds
                              );
                            }}
                            placeholder="mm"
                            min={0}
                            value={
                              measurementType._minutes === 0
                                ? ""
                                : measurementType._minutes
                            }
                          />
                          <FormikInput
                            label={""}
                            name={`timeMeasurements.${i}._seconds`}
                            type="number"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              // Set the seconds for this timeMeasurement
                              setFieldValue(
                                `timeMeasurements.${i}._seconds`,
                                Number(e.target.value)
                              );

                              // Update the total seconds for this measurement
                              setFieldValue(
                                `timeMeasurements.${i}.seconds`,
                                measurementType._minutes * 60 +
                                  Number(e.target.value)
                              );
                            }}
                            placeholder="ss"
                            min={0}
                            value={
                              measurementType._seconds === 0
                                ? ""
                                : measurementType._seconds
                            }
                          />
                        </div>

                        <FormikInput
                          label={""}
                          name={`timeMeasurements.${i}.seconds`}
                          type="hidden"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <Sidebar>
              <Heading level={3} showBorder={false}>
                Summary
              </Heading>

              {values.workNumber ? (
                <p>
                  The selected SGP number is{" "}
                  <span className="font-semibold">{values.workNumber}</span>.
                </p>
              ) : (
                <p className="text-sm italic">No SGP number selected.</p>
              )}

              {values.barcodes.length > 0 && (
                <p>
                  <span className="font-semibold">
                    {values.barcodes.length}
                  </span>{" "}
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
