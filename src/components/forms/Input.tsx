import React from "react";
import Label from "./Label";
import { Field } from "formik";
import { FormikErrorMessage } from "./index";

interface InputProps {
  label: string;
  name: string;
  type?: string;
}

const Input = ({ label, name, type = "text" }: InputProps) => {
  return (
    <>
      <Label name={label}>
        <Field
          type={type}
          className="form-input mt-1 block w-full md:w-2/3 disabled:opacity-75"
          name={name}
        />
      </Label>
      <FormikErrorMessage name={name} />
    </>
  );
};

export default Input;
