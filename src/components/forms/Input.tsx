import React from "react";
import Label from "./Label";
import { Field } from "formik";
import { FormikErrorMessage } from "./index";

interface InputProps {
  label: string;
  name: string;
  type?: string;
}
//mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md
const Input = ({ label, name, type = "text" }: InputProps) => {
  return (
    <>
      <Label name={label}>
        <Field
          type={type}
          className="mt-1 focus:ring-sdb-100 focus:border-sdb-100 block w-full md:w-2/3 border-gray-300 rounded-md disabled:opacity-75"
          name={name}
        />
      </Label>
      <FormikErrorMessage name={name} />
    </>
  );
};

export default Input;
