import React, { ChangeEvent, useState } from "react";
import { Field, useFormikContext } from "formik";
import { Input } from "./Input";
import Label from "./Label";
import FormikSelect from "./Select";
import { ControlType, PermData } from "../../types/sdk";
import { objectKeys } from "../../lib/helpers";
import { FormikErrorMessage } from "./index";

type PermDataFieldProps = {
  /**
   * The name of the Formik field
   */
  name: string;
};

export default function PermDataField<T>({ name }: PermDataFieldProps) {
  const { setFieldValue, getFieldProps } = useFormikContext<T>();
  const [isControl, setIsControl] = useState(false);
  const permData = getFieldProps<PermData>(name).value;

  function onIsControlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    setFieldValue(name, {
      address: permData.address,
      seconds: isChecked ? undefined : 1,
      controlType: isChecked ? ControlType.Positive : undefined,
    });

    setIsControl(isChecked);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center gap-x-2">
        <Label htmlFor={`${name}checkbox`} name={"Control?"} />
        <Input
          type="checkbox"
          id={`${name}checkbox`}
          checked={isControl}
          onChange={onIsControlChange}
        />
      </div>

      {permData.controlType && (
        <FormikSelect
          name={formikName(name, "controlType")}
          label={"Control Type"}
        >
          {objectKeys(ControlType).map((controlTypeKey) => (
            <option key={controlTypeKey} value={ControlType[controlTypeKey]}>
              {controlTypeKey}
            </option>
          ))}
        </FormikSelect>
      )}

      {!!permData.seconds && (
        <>
          <Label name={"Perm Time (minutes)"}>
            <Field name={formikName(name, "seconds")}>
              {({ field }: any) => (
                <Input
                  type={"number"}
                  min={1}
                  step={1}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFieldValue(
                      formikName(name, "seconds"),
                      Number(e.currentTarget.value)
                    )
                  }
                  value={field.value ?? ""}
                />
              )}
            </Field>
          </Label>
          <FormikErrorMessage name={name} />
        </>
      )}
    </div>
  );
}

function formikName(prefix: string, name: string): string {
  return [prefix, name].join(".");
}
