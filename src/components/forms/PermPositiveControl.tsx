import React, { useState } from "react";
import { Field, useFormikContext } from "formik";
import { Input } from "./Input";
import Label from "./Label";
import { ControlType, LabwareFieldsFragment, PermData } from "../../types/sdk";
import { FormikErrorMessage, formikName } from "./index";

type PermPositiveControlProps = {
  /**
   * The name of the Formik field. Will be used as the prefix for {@link PermData PermData's} properties
   * e.g. a name of {@code "permData.0"} will produce properties such as {@code "permData.0.address"}
   */
  name: string;

  /**
   * The tube to be added to a slot as a control
   */
  controlTube: LabwareFieldsFragment | undefined;
};

/**
 * {@link PermData} Formik input
 */
export default function PermPositiveControl<T>({
  name,
  controlTube,
}: PermPositiveControlProps) {
  const { setFieldValue, getFieldProps } = useFormikContext<T>();
  const [isControl, setIsControl] = useState(false);
  const permData = getFieldProps<PermData>(name).value;
  /**
   * When the control checkbox is checked, set/unset seconds and controlType
   */
  function onIsControlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    setFieldValue(name, {
      address: permData.address,
      seconds: isChecked ? undefined : 1,
      controlType: isChecked ? ControlType.Positive : undefined,
      controlBarcode: isChecked && controlTube ? controlTube.barcode : "",
    });

    setIsControl(isChecked);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center gap-x-2">
        <Label htmlFor={`${name}checkbox`} name={"Positive Control?"} />
        <Input
          type="checkbox"
          id={`${name}checkbox`}
          checked={isControl}
          onChange={onIsControlChange}
        />
      </div>

      {
        <>
          <Label name={"Control Tube"}>
            <Field name={formikName(name, "controlBarcode")}>
              {({ field }: any) => (
                <Input
                  disabled={true}
                  value={field.value ?? ""} // Stops react complaining about "controlled/uncontrolled" inputs
                  className="flex flex-col font-medium text-blue-500"
                />
              )}
            </Field>
          </Label>
          <FormikErrorMessage name={name} />
        </>
      }
    </div>
  );
}
