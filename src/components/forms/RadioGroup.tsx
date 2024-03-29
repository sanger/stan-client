import React, { useContext } from 'react';
import { Field } from 'formik';
import { FormikErrorMessage } from './index';

interface RadioGroupProps {
  label: string;
  name: string;
  children: React.ReactNode;
  withFormik?: boolean;
}

const RadioGroupContext = React.createContext({ name: '' });

const RadioGroup = ({ label, name, children, withFormik = true }: RadioGroupProps) => {
  return (
    <>
      <div className="mt-2">
        <span className="text-gray-800">{label}</span>
        <div className="lg:space-x-6">
          <RadioGroupContext.Provider value={{ name }}>{children}</RadioGroupContext.Provider>
        </div>
      </div>
      {withFormik && <FormikErrorMessage name={name} />}
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
      <Field type="radio" className="form-radio text-sp" name={ctx.name} value={value} data-testid={value} />
      <span className="ml-2">{name}</span>
    </label>
  );
};

interface RadioButtonProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string;
}
export const RadioButtonInput = React.forwardRef<HTMLInputElement, RadioButtonProps>((props, ref) => {
  const ctx = useContext(RadioGroupContext);
  return (
    <label className="inline-flex items-center">
      <input ref={ref} {...props} type={'radio'} name={props.name ?? ctx.name} />
      <span className={`ml-2 ${props.disabled && 'text-gray-400'}`}>{props.label}</span>
    </label>
  );
});
