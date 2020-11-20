import React, { useContext } from "react";
import { Field } from "formik";
import { FormikErrorMessage } from "./index";

interface RadioGroupProps {
  label: string;
  name: string;
  children: JSX.Element[];
}

const RadioGroupContext = React.createContext({ name: "" });

const RadioGroup = ({ label, name, children }: RadioGroupProps) => {
  return (
    <>
      <div className="mt-2">
        <span className="text-gray-800">{label}</span>
        <div className="space-x-6">
          <RadioGroupContext.Provider value={{ name }}>
            {children}
          </RadioGroupContext.Provider>
        </div>
      </div>
      <FormikErrorMessage name={name} />
    </>
  );
};

export default RadioGroup;

interface RadioButtonParameters {
  name: string;
  value: string;
}

export const RadioButton = ({ name, value }: RadioButtonParameters) => {
  const ctx = useContext(RadioGroupContext);
  return (
    <label className="inline-flex items-center">
      <Field
        type="radio"
        className="form-radio text-sp"
        name={ctx.name}
        value={value}
      />
      <span className="ml-2">{name}</span>
    </label>
  );
};
