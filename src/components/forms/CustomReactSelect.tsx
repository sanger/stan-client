import React from 'react';
import Label from './Label';
import { useFormikContext } from 'formik';
import { FormikErrorMessage } from './index';
import ReactSelect, { Props } from 'react-select';
const defaultClassNames =
  'block w-full rounded-md focus:outline-0  disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

type OptionType = {
  value: string;
  label: string;
};

type ValueType = OptionType | OptionType[] | undefined | unknown;

interface CustomReactSelectProps extends Props {
  label?: string;
  name?: string;
  className?: string;
  options: OptionType[];
  emptyOption?: boolean;
  handleChange?: (value: OptionType | OptionType[]) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const defaultValue = (options: OptionType[], value: any) => {
  return options ? options.find((option) => option.value === value) : '';
};

const hasValueType = (obj: ValueType): obj is OptionType | OptionType[] => {
  return obj !== undefined && obj !== null && (Array.isArray(obj) || (typeof obj === 'object' && 'value' in obj));
};

export const NormalReactSelect = React.forwardRef<ReactSelect, CustomReactSelectProps>(
  ({ label, name, className, emptyOption = false, options, value, placeholder, handleChange, onBlur, ...props }) => {
    const onChangeValue = React.useCallback(
      (value) => {
        if (!hasValueType(value)) return;
        handleChange?.(value);
      },
      [handleChange]
    );

    const memoOptions = React.useMemo(() => {
      debugger;
      return emptyOption ? [{ value: '', label: '' }, ...options] : [...options];
    }, [emptyOption, options]);

    const sdbColor = '#7980B9';
    return (
      <>
        <Label name={label ?? ''} className={className}>
          <ReactSelect
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: `1px solid ${sdbColor}`,
                boxShadow: state.isFocused ? `0px 0px 2px ${sdbColor}` : 'none',
                '&:hover': {
                  border: `1px solid ${sdbColor}`,
                  boxShadow: `0px 0px 6px ${sdbColor}`
                },
                'input:focus': {
                  boxShadow: 'none'
                }
              }),
              option: (styles, { isDisabled }) => {
                return {
                  ...styles,
                  backgroundColor: isDisabled ? 'gray' : '#626167',
                  color: 'white',
                  cursor: isDisabled ? 'not-allowed' : 'default',
                  '&:hover': {
                    backgroundColor: isDisabled ? 'gray' : '#4792E4'
                  },
                  height: '30px',
                  padding: '0px 0px 8px 8px'
                };
              }
            }}
            name={name}
            onChange={(val) => onChangeValue(val)}
            onBlur={onBlur}
            options={memoOptions}
            value={defaultValue(options, value)}
            placeholder={placeholder ?? ''}
            {...props}
          />
        </Label>
      </>
    );
  }
);

const FormikReactSelect = ({
  label,
  name,
  className,
  emptyOption = false,
  options,
  value,
  placeholder,
  handleChange,
  onBlur,
  ...props
}: CustomReactSelectProps) => {
  const { setFieldValue, setFieldTouched } = useFormikContext() ?? {};
  const onChangeValue = React.useCallback(
    (value: ValueType) => {
      if (!hasValueType(value)) return;
      const val = value ? (Array.isArray(value) ? value.map((val) => val.value) : value.value) : [];
      name && setFieldValue?.(name, val);
      handleChange?.(value);
    },
    [setFieldValue, name, handleChange]
  );

  const handleBlur = React.useCallback(() => {
    name && setFieldTouched(name);
    onBlur?.();
  }, [setFieldTouched, name, onBlur]);

  return (
    <div className={`${defaultClassNames} ${className}`}>
      <NormalReactSelect
        name={name}
        label={label}
        onChange={(val: ValueType) => onChangeValue(val)}
        options={options}
        onBlur={handleBlur}
        emptyOption={emptyOption}
        placeholder={placeholder}
        {...props}
      />

      {name && <FormikErrorMessage name={name} />}
    </div>
  );
};

const CustomReactSelect = ({
  label,
  name,
  className,
  emptyOption = false,
  options,
  value,
  ...props
}: CustomReactSelectProps) => {
  return name ? (
    <FormikReactSelect
      name={name}
      label={label}
      className={className}
      options={options}
      value={value}
      emptyOption={emptyOption}
      {...props}
    />
  ) : (
    <NormalReactSelect
      label={label}
      className={className}
      options={options}
      value={value}
      emptyOption={emptyOption}
      {...props}
    />
  );
};

export default CustomReactSelect;
