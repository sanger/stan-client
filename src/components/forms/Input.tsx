import React from 'react';
import Label from './Label';
import { Field } from 'formik';
import { FormikErrorMessage, onPreventEnterKeyDefault } from './index';
import classNames from 'classnames';

const defaultInputClassNames =
  'ring-sdb-100 focus:border-sdb-100 block border border-gray-300 rounded-md disabled:opacity-75 disabled:cursor-not-allowed';

interface FormikInputProps {
  label: string;
  name: string;
  type?: string;
  [key: string]: any;
  displayTag?: string;
  info?: React.ReactNode;
  preventEnterKeyDefault?: boolean;
}

const FormikInput = ({
  label,
  name,
  type = 'text',
  displayTag,
  info,
  preventEnterKeyDefault = true,
  ...rest
}: FormikInputProps) => {
  const inputClassNames = classNames(
    {
      'bg-white border h-10 w-full disabled:bg-gray-200': type !== 'checkbox'
    },
    defaultInputClassNames
  );
  return (
    <>
      <div>
        <Label name={label} displayTag={displayTag} info={info} className={'whitespace-nowrap'}>
          <Field
            type={type}
            data-testid={label}
            className={inputClassNames}
            name={name}
            onKeyDown={preventEnterKeyDefault ? onPreventEnterKeyDefault : undefined}
            {...rest}
          />
        </Label>
      </div>

      <FormikErrorMessage name={name} />
    </>
  );
};

export default FormikInput;

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const inputClassNames = classNames(
    {
      'w-full h-10 disabled:bg-gray-200': props.type !== 'checkbox' || props.type !== 'radio'
    },
    defaultInputClassNames
  );
  return <input ref={ref} className={inputClassNames} {...props} />;
});
