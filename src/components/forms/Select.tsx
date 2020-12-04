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
        className={
          "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
        }
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
