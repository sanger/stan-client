import React from "react";
import Label from "./Label";
import { Field } from "formik";
import { FormikErrorMessage } from "./index";
import classNames from "classnames";

const defaultInputClassNames =
  "focus:ring-sdb-100 focus:border-sdb-100 border-gray-300 rounded-md disabled:opacity-75 disabled:cursor-not-allowed";

interface FormikInputProps {
  label: string;
  name: string;
  type?: string;
  [key: string]: any;
  displayTag?: string;
}

const FormikInput = ({
  label,
  name,
  type = "text",
  displayTag,
  ...rest
}: FormikInputProps) => {
  const inputClassNames = classNames(
    {
      "w-full disabled:bg-gray-200": type !== "checkbox",
    },
    defaultInputClassNames
  );
  return (
    <>
      <Label name={label} displayTag={displayTag}>
        <Field
          type={type}
          data-testid={label}
          className={inputClassNames}
          name={name}
          {...rest}
        />
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
    const inputClassNames = classNames(
      {
        "w-full disabled:bg-gray-200":
          props.type !== "checkbox" || props.type !== "radio",
      },
      defaultInputClassNames
    );
    return <input ref={ref} className={inputClassNames} {...props} />;
  }
);
