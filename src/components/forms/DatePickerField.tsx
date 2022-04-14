import { useField, useFormikContext } from "formik";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Label from "./Label";

interface FormikFieldProps {
  label: string;
  name: string;
  type?: string;
  [key: string]: any;
}

export const DatePickerField = ({ label, name, ...rest }: FormikFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);
  return (
    <>
      {/**There is a known issue with DatePicker when wrpaped inside Label that the popup not getting closed on selection.
         To avoid prevent default action in Label**/}
      <Label name={label} onClick={(e) => e.preventDefault()}>
        <DatePicker
          {...field}
          {...rest}
          selected={field.value}
          onChange={(val) => {
            setFieldValue(field.name, val);
          }}
          dateFormat="dd-MM-yyyy"
          closeOnScroll={(e) => e.target === document}
          className={
            "focus:ring-sdb-100 focus:border-sdb-100 block border-gray-300 rounded-md disabled:opacity-75 disabled:cursor-not-allowed"
          }
          maxDate={new Date()}
        />
      </Label>
    </>
  );
};

export default DatePickerField;
