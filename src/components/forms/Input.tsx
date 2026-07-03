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
  className,
  ...rest
}: FormikInputProps) => {
  const inputClassNames = classNames(
    {
      'bg-white border w-full disabled:bg-gray-200': type !== 'checkbox',
      'h-10': type !== 'checkbox' && type !== 'textarea'
    },
    defaultInputClassNames
  );
  return (
    <>
      <div className={className}>
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

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  extraClassName?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ extraClassName, ...rest }, ref) => {
  const inputClassNames = classNames(
    {
      'w-full bg-white h-10 disabled:bg-gray-200 text-center': rest.type !== 'checkbox' && rest.type !== 'radio'
    },
    defaultInputClassNames
  );

  return <input ref={ref} className={`${inputClassNames} ${extraClassName || ''}`} {...rest} />;
});

export const FormikCheckbox = ({ label, dataTestId, name, className, ...rest }: Omit<FormikInputProps, 'type'>) => {
  return (
    <Label name={label} className={'ml-4 mt-1'}>
      <Field
        type="checkbox"
        data-testid={dataTestId}
        name={name}
        className="appearance-none h-6 w-6 mt-1 rounded-md border border-gray-300 focus:border-sdb-100
                                     checked:before:content-['✔'] checked:bg-blue-300
                                   checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center"
      />
    </Label>
  );
};
