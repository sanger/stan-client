import React from "react";
import Label from "./Label";
import { Field, FieldAttributes } from "formik";
import { FormikErrorMessage } from "./index";

interface SelectProps extends FieldAttributes<any> {
  label: string;
  name: string;
  className?: string;
  children: JSX.Element | JSX.Element[];
  emptyOption?: boolean;
}

const Select = ({
  label,
  name,
  className,
  children,
  emptyOption = false,
  ...props
}: SelectProps) => (
  <>
    <Label name={label} className={className}>
      <Field
        className={"form-select block w-full md:w-1/2 mt-1"}
        as={"select"}
        name={name}
        {...props}
      >
        {emptyOption && <option value="" />}
        {children}
      </Field>
    </Label>
    <FormikErrorMessage name={name} />
  </>
);

export default Select;
