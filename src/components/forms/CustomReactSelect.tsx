import React from 'react';
import Label from './Label';
import { useFormikContext } from 'formik';
import { FormikErrorMessage } from './index';
import ReactSelect, { components, Props } from 'react-select';
const defaultClassNames =
  'block w-full rounded-md focus:outline-0  disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

export type OptionType = {
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
  handleBlur?: (value?: OptionType | OptionType[]) => void;
  placeholder?: string;
  dataTestId?: string;
  isMulti?: boolean;
  valueAsNumber?: boolean;
  fixedWidth?: boolean;
}

const defaultValue = (options: OptionType[], value: any, isMulti: boolean) => {
  if (value === undefined) {
    return isMulti ? [] : undefined;
  }
  if (isMulti && Array.isArray(value)) {
    return options ? options.filter((option) => value.some((val) => val === option.label || val === option.value)) : [];
  } else {
    return options.find((option) => option.label === value || option.value === value);
  }
};

const hasValueType = (obj: ValueType): obj is OptionType | OptionType[] => {
  return obj !== undefined && obj !== null && (Array.isArray(obj) || (typeof obj === 'object' && 'value' in obj));
};

export const NormalReactSelect = ({
  label,
  name,
  className,
  emptyOption = false,
  options,
  value,
  placeholder,
  handleChange,
  handleBlur,
  dataTestId,
  isMulti = false,
  fixedWidth = false,
  ...props
}: CustomReactSelectProps) => {
  const onChangeValue = React.useCallback(
    (value) => {
      if (!hasValueType(value)) return;
      handleChange?.(value);
    },
    [handleChange]
  );
  const onBlur = React.useCallback(
    (value) => {
      if (!hasValueType(value)) return;
      handleBlur?.(value);
    },
    [handleBlur]
  );

  const memoOptions = React.useMemo(() => {
    return emptyOption ? [{ value: '', label: '' }, ...options] : [...options];
  }, [emptyOption, options]);

  const Option = (props: any) => {
    return (
      <div>
        <components.Option {...props} className={'space-x-2'}>
          {props.isSelected && <input type="checkbox" checked={props.isSelected} onChange={() => null} />}
          <label className={`${props.isSelected ? 'mr-2' : 'ml-6 mr-2'}`}>{props.label}</label>
        </components.Option>
      </div>
    );
  };
  const sdbColor = '#7980B9';
  return (
    <div data-testid={dataTestId ?? 'select-div'} className={`md:w-full ${className}`}>
      <Label name={label ?? ''}>
        <ReactSelect
          menuPosition={'fixed'}
          name={name}
          onChange={(val) => onChangeValue(val)}
          onBlur={(val) => onBlur(val)}
          options={memoOptions}
          value={defaultValue(memoOptions, value, isMulti)}
          isMulti={isMulti}
          placeholder={placeholder ?? ''}
          components={{ Option, IndicatorSeparator: () => null }}
          {...props}
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
            menu: (base) => ({
              ...base,
              width: 'max-content',
              minWidth: '100%'
            }),
            option: (styles, { isDisabled, label }) => {
              return {
                ...styles,
                backgroundColor: isDisabled ? 'gray' : '#626167',
                color: 'white',
                cursor: isDisabled ? 'not-allowed' : 'default',
                '&:hover': {
                  backgroundColor: isDisabled ? 'gray' : '#4792E4'
                },
                height: label.length === 0 ? '35px' : styles.height,
                padding: '2px 2px 8px 8px'
              };
            }
          }}
        />
      </Label>
    </div>
  );
};

const FormikReactSelect = ({
  label,
  name,
  className,
  emptyOption,
  isMulti,
  options,
  value,
  dataTestId,
  placeholder,
  handleChange,
  handleBlur,
  valueAsNumber,
  fixedWidth,
  ...props
}: CustomReactSelectProps) => {
  const { setFieldValue, setFieldTouched } = useFormikContext() ?? {};
  const onChangeValue = React.useCallback(
    (value: ValueType) => {
      if (!hasValueType(value)) return;
      if (!value) return;
      let val = Array.isArray(value)
        ? value.map((val) => (valueAsNumber ? Number(val.value) : val.value))
        : valueAsNumber
        ? Number(value.value)
        : value.value;
      name && setFieldValue?.(name, val);
      handleChange?.(value);
    },
    [setFieldValue, name, handleChange, valueAsNumber]
  );

  const onBlur = React.useCallback(() => {
    name && setFieldTouched(name);
    handleBlur?.();
  }, [setFieldTouched, name, handleBlur]);

  return (
    <div className={`${defaultClassNames} ${className}`} data-testid="form_select-div">
      <NormalReactSelect
        name={name}
        label={label}
        onChange={(val: ValueType) => onChangeValue(val)}
        options={options}
        onBlur={onBlur}
        emptyOption={emptyOption}
        dataTestId={dataTestId}
        placeholder={placeholder}
        isMulti={isMulti}
        value={value}
        fixedWidth={fixedWidth}
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
  emptyOption,
  options,
  value,
  dataTestId,
  isMulti,
  fixedWidth,
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
      isMulti={isMulti}
      dataTestId={dataTestId}
      fixedWidth={fixedWidth}
      {...props}
    />
  ) : (
    <NormalReactSelect
      label={label}
      className={className}
      options={options}
      value={value}
      emptyOption={emptyOption}
      dataTestId={dataTestId}
      isMulti={isMulti}
      fixedWidth={fixedWidth}
      {...props}
    />
  );
};

export default CustomReactSelect;
