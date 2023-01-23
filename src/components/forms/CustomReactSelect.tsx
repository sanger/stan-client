import React from 'react';
import Label from './Label';
import { useFormikContext } from 'formik';
import { FormikErrorMessage } from './index';
import ReactSelect, { Props } from 'react-select';
const defaultClassNames =
  'block w-full rounded-md focus:outline-0 focus:ring-sdb-100 focus:border-sdb-100 disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

type OptionType = {
  value: string;
  label: string;
};

interface FormikSelectProps extends Props {
  label: string;
  name: string;
  className?: string;
  options: OptionType[];
  emptyOption?: boolean;
}

const defaultValue = (options: OptionType[], value: any) => {
  return options ? options.find((option) => option.value === value) : '';
};
const CustomFormikReactSelect = ({
  label,
  name,
  className,
  emptyOption = false,
  options,
  value,
  ...props
}: FormikSelectProps) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();

  const handleChange = React.useCallback(
    (value) => {
      setFieldValue?.(name, value);
    },
    [setFieldValue]
  );
  const handleBlur = React.useCallback(() => {
    setFieldTouched(name);
  }, [setFieldTouched]);

  return (
    <>
      <Label name={label} className={className}>
        <ReactSelect
          classNamePrefix="select2-selection"
          className={defaultClassNames}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? 'grey' : 'yellow'
            })
          }}
          name={name}
          onChange={handleChange}
          onBlur={handleBlur}
          options={options}
          value={defaultValue(options, value)}
          {...props}
        />
      </Label>

      <FormikErrorMessage name={name} />
    </>
  );
};

export default CustomFormikReactSelect;

interface CustomSelectProps extends Props {}
export const CustomReactSelect = React.forwardRef<ReactSelect, CustomSelectProps>(({ ...props }) => (
  <div>
    <ReactSelect className={defaultClassNames} {...props} />
  </div>
));
