import React, { useEffect } from "react";
import Panel from "../Panel";
import { useLabwareContext } from "../labwareScanner/LabwareScanner";
import Labware from "../labware/Labware";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import FormikInput from "../forms/Input";
import RemoveButton from "../buttons/RemoveButton";
import BlueButton from "../buttons/BlueButton";
import { useFormikContext } from "formik";
import { VisiumQCData } from "../../pages/VisiumQC";

export default function CDNAAnalysis() {
  const { labwares, removeLabware } = useLabwareContext();
  const { setFieldValue, values } = useFormikContext<VisiumQCData>();

  useEffect(() => {
    if (labwares.length < 1) return;

    // Build the concentration slotMeasurements for this piece of labware
    setFieldValue(
      "slotMeasurements",
      labwares[0].slots.filter(isSlotFilled).map((slot) => {
        return {
          address: slot.address,
          name: "concentration",
          value: "",
        };
      })
    );
  }, [labwares, setFieldValue]);

  return labwares.length > 0 ? (
    <Panel>
      <div className="flex flex-col items-center gap-y-3">
        <div className={"self-end"}>
          <RemoveButton onClick={() => removeLabware(labwares[0].barcode)} />
        </div>

        <Labware
          labware={labwares[0]}
          slotBuilder={(slot) => {
            const index = values.slotMeasurements.findIndex(
              (sm) => sm.address === slot.address
            );

            if (index < 0) return;

            return (
              <FormikInput
                label={"Concentration (ng/\u00B5l)"}
                name={`slotMeasurements.${index}.value`}
              />
            );
          }}
        />

        <div className="self-end">
          {/* TODO: Make this actually submit the form */}
          <BlueButton type={"submit"}>Save</BlueButton>
        </div>
      </div>
    </Panel>
  ) : null;
}
