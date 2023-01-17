import React from 'react';
import Label from './Label';
import { Field } from 'formik';
import { FormikErrorMessage } from './index';
import classNames from 'classnames';
import Information from '../notifications/Information';

const defaultInputClassNames =
  'focus:ring-sdb-100 focus:border-sdb-100 block border-gray-300 rounded-md disabled:opacity-75 disabled:cursor-not-allowed';

interface FormikInputProps {
  label: string;
  name: string;
  type?: string;
  [key: string]: any;
  displayTag?: string;
  info?: React.ReactNode;
}

const FormikInput = ({ label, name, type = 'text', displayTag, info, ...rest }: FormikInputProps) => {
  const inputClassNames = classNames(
    {
      'w-full disabled:bg-gray-200': type !== 'checkbox'
    },
    defaultInputClassNames
  );
  return (
    <>
      <div className={'inline-flex'}>
        <Label name={label} displayTag={displayTag} /> {info && <Information className={'block'}>{info}</Information>}
      </div>
      <Field type={type} data-testid={label} className={inputClassNames} name={name} {...rest} />
      <FormikErrorMessage name={name} />
    </>
  );
};

export default FormikInput;

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const inputClassNames = classNames(
    {
      'w-full disabled:bg-gray-200': props.type !== 'checkbox' || props.type !== 'radio'
    },
    defaultInputClassNames
  );
  return <input ref={ref} className={inputClassNames} {...props} />;
});
