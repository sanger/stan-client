import React from "react";
import Label from "./Label";
import { Field } from "formik";
import { FormikErrorMessage } from "./index";

const inputClassNames =
  "focus:ring-sdb-100 focus:border-sdb-100 block w-full border-gray-300 rounded-md disabled:opacity-75";

interface FormikInputProps {
  label: string;
  name: string;
  type?: string;
}

const FormikInput = ({ label, name, type = "text" }: FormikInputProps) => {
  return (
    <>
      <Label name={label}>
        <Field type={type} className={inputClassNames} name={name} />
      </Label>
      <FormikErrorMessage name={name} />
    </>
  );
};

export default FormikInput;

interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} className={inputClassNames} {...props} />;
  }
);
