import React, { useRef } from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner, {
  useLabwareContext,
} from "../components/labwareScanner/LabwareScanner";
import LabwareScannerSlotsTable from "../components/labwareScanner/LabwareScannerSlotsTable";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import {
  ControlType,
  LabwareFieldsFragment,
  RecordPermMutation,
  RecordPermRequest,
  SlotFieldsFragment,
} from "../types/sdk";
import Labware from "../components/labware/Labware";
import PermDataField from "../components/forms/PermDataField";
import FormikInput from "../components/forms/Input";
import BlueButton from "../components/buttons/BlueButton";
import { reload, stanCore } from "../lib/sdk";
import * as Yup from "yup";
import { FormikErrorMessage } from "../components/forms";
import Warning from "../components/notifications/Warning";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import { isSlotEmpty, isSlotFilled } from "../lib/helpers/slotHelper";
import columns from "../components/dataTable/labwareColumns";
import LabwareScanPanel from "../components/labwareScanPanel/LabwareScanPanel";
import PermDPositiveControl from "../components/forms/PermPositiveControl";

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().optional().label("SGP number"),
  barcode: Yup.string().required().label("Barcode"),
  permData: Yup.array()
    .min(1)
    .of(
      Yup.object().shape({
        address: Yup.string().required().label("Address"),
        seconds: Yup.number()
          .integer()
          .positive()
          .optional()
          .label("Perm time"),
        controlType: Yup.string()
          .optional()
          .oneOf(Object.values(ControlType))
          .label("Control type"),
        controlBarcode: Yup.string().optional().label("Control barcode"),
      })
    ),
});

export default function VisiumPerm() {
  const [current, send] = useMachine(
    createFormMachine<RecordPermRequest, RecordPermMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordPerm({ request: e.values });
        },
      },
    })
  );

  const { serverError } = current.context;

  const onSubmit = async (values: RecordPermRequest) => {
    values.permData = values.permData.map((pm) => {
      if (pm.seconds) {
        // Form actually displays time as minutes, so we need to convert to seconds.
        return Object.assign({}, pm, { seconds: pm.seconds * 60 });
      } else {
        return pm;
      }
    });
    send({ type: "SUBMIT_FORM", values });
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium Permabilisation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<RecordPermRequest>
            initialValues={{ barcode: "", workNumber: undefined, permData: [] }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="space-y-2">
                  <Heading level={2}>SGP Number</Heading>

                  <p>
                    You may optionally select an SGP number to associate with
                    this operation.
                  </p>

                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect name={"workNumber"} />
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>

                  <p>
                    Please scan in the slide you wish to permabilisation add
                    times for.
                  </p>

                  <FieldArray name={"permData"}>
                    {({ push, remove }) => (
                      <LabwareScanner
                        onAdd={(labware) => {
                          setFieldValue("barcode", labware.barcode);
                          labware.slots.forEach((slot) =>
                            push(
                              isSlotFilled(slot)
                                ? {
                                    address: slot.address,
                                    seconds: 1,
                                  }
                                : { address: slot.address }
                            )
                          );
                        }}
                        onRemove={() => {
                          setFieldValue("barcode", "");
                          values.permData.forEach((value, i) => remove(i));
                        }}
                        limit={1}
                      >
                        <LabwareScannerSlotsTable />
                        <VisiumPermForm />
                      </LabwareScanner>
                    )}
                  </FieldArray>

                  <FormikErrorMessage name={"barcode"} />
                </div>

                {serverError && (
                  <Warning
                    message={"Failed to record perm times"}
                    error={serverError}
                  />
                )}

                <div className="flex flex-row items-center justify-end">
                  <BlueButton type="submit">Submit</BlueButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <OperationCompleteModal
          show={current.matches("submitted")}
          message={"Visium Permeabilisation complete"}
          onReset={reload}
        >
          <p>
            If you wish to start the process again, click the "Reset Form"
            button. Otherwise you can return to the Home screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}

function VisiumPermForm() {
  const { labwares } = useLabwareContext();
  const { values } = useFormikContext<RecordPermRequest>();
  const controlTubeRef = useRef<LabwareFieldsFragment | undefined>(undefined);
  if (values.permData.length === 0 || labwares.length === 0) {
    return null;
  }
  const addressToIndexMap: Map<string, number> = new Map(
    values.permData.map((pd, index) => [pd.address, index] as const)
  );

  return (
    <>
      <FormikInput
        label={""}
        name={"barcode"}
        type={"hidden"}
        value={labwares[0].barcode}
      />
      <div className="flex flex-row" />
      <Heading level={2}>Control Tube</Heading>
      <p>Please scan in the tube you wish to assign as a control tube.</p>
      <div className="flex flex-row" />
      <LabwareScanner
        onAdd={(labware) => {
          controlTubeRef.current = labware;
        }}
        onRemove={() => {
          controlTubeRef.current = undefined;
        }}
        limit={1}
      >
        <LabwareScanPanel columns={[columns.barcode()]} />
      </LabwareScanner>
      <div className="flex flex-row" />
      <div className="mt-10 flex flex-row items-center justify-around">
        <Labware
          labware={labwares[0]}
          slotBuilder={(slot: SlotFieldsFragment) => {
            if (addressToIndexMap.has(slot.address)) {
              return isSlotEmpty(slot) ? (
                <PermDPositiveControl
                  name={`permData.${addressToIndexMap.get(slot.address)}`}
                  controlTube={controlTubeRef.current}
                />
              ) : (
                <PermDataField
                  name={`permData.${addressToIndexMap.get(slot.address)}`}
                />
              );
            } else {
              return null;
            }
          }}
        />
      </div>
    </>
  );
}
