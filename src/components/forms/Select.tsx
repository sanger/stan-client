import React from "react";
import Label from "./Label";
import { Field, FieldAttributes } from "formik";
import { FormikErrorMessage } from "./index";

const defaultClassNames =
  "block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed";

interface FormikSelectProps extends FieldAttributes<any> {
  label: string;
  name: string;
  className?: string;
  children: JSX.Element | JSX.Element[];
  emptyOption?: boolean;
}

const FormikSelect = ({
  label,
  name,
  className,
  children,
  emptyOption = false,
  ...props
}: FormikSelectProps) => (
  <>
    <Label name={label} className={className}>
      <Field className={defaultClassNames} as={"select"} name={name} {...props}>
        {emptyOption && <option value="" />}
        {children}
      </Field>
    </Label>
    <FormikErrorMessage name={name} />
  </>
);

export default FormikSelect;

interface SelectProps
  extends React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  emptyOption?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, emptyOption = false, ...props }, ref) => (
    <select ref={ref} className={defaultClassNames} {...props}>
      {emptyOption && <option value="" />}
      {children}
    </select>
  )
);
