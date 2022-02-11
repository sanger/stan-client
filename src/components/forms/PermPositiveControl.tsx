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

  /**
   * Callback handler to notify that PermData positive control is set for this address.
   * This can be used to reset any other addresses having permData positive control.
   */
  onPositiveControlSelection?: (name: string) => void;
};

/**
 * {@link PermData} Formik input
 */
export default function PermPositiveControl<T>({
  name,
  controlTube,
  onPositiveControlSelection,
}: PermPositiveControlProps) {
  const { setFieldValue, getFieldProps } = useFormikContext<T>();
  const permData = getFieldProps<PermData>(name).value;
  const [isControl, setIsControl] = useState(false);

  /***
   * Reset controlType, controlBarcode from permData if there is no Control Tube
   */
  React.useEffect(() => {
    if (
      !controlTube &&
      permData.controlType === ControlType.Positive &&
      permData.controlBarcode !== undefined
    ) {
      setFieldValue(name, {
        address: permData.address,
        controlType: undefined,
        controlBarcode: undefined,
      });
    }
    setIsControl(permData.controlType !== undefined);
  }, [controlTube, setIsControl, name, permData, setFieldValue]);

  /**
   * When the control checkbox is checked, set/unset controlBarcode and set controlType to ControlType.Positive
   */
  function onIsControlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;
    setFieldValue(name, {
      address: permData.address,
      controlType: isChecked ? ControlType.Positive : undefined,
      controlBarcode:
        isChecked && controlTube ? controlTube.barcode : undefined,
    });
    setIsControl(isChecked);
    //Callback handler to notify selection
    if (isChecked && onPositiveControlSelection) {
      onPositiveControlSelection(name);
    }
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
          disabled={!controlTube}
        />
      </div>
      <div className="flex flex-row gap-x-2">
        <Label name={"Control Tube:"} />
        <Field name={formikName(name, "controlBarcode")}>
          {({ field }: any) => (
            <Label
              data-testid={`${name}.label`}
              name={""}
              className="font-bold text-blue-500"
            >
              {field.value ?? ""}
            </Label>
          )}
        </Field>
      </div>
      <FormikErrorMessage name={name} />
    </div>
  );
}
