import React from 'react';
import Label from './Label';
import { useFormikContext } from 'formik';
import { FormikErrorMessage, onPreventEnterKeyDefault } from './index';
import ReactSelect, { components, Props } from 'react-select';
import AddButton from '../buttons/AddButton';

const defaultClassNames =
  'block w-full rounded-md focus:outline-0  disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

export type OptionType = {
  value: string;
  label: string;
};

type ValueType = OptionType | OptionType[] | undefined | unknown;

type AddButtonProps = {
  className?: string;
  dataTestId: string;
  onClick: () => void;
};

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
  fixedWidth?: number;
  addButton?: AddButtonProps;
  preventEnterKeyDefault?: boolean;
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
  fixedWidth,
  addButton,
  preventEnterKeyDefault = true,
  ...props
}: CustomReactSelectProps) => {
  const onChangeValue = React.useCallback(
    (value: ValueType) => {
      if (!hasValueType(value)) return;
      handleChange?.(value);
    },
    [handleChange]
  );
  const onBlur = React.useCallback(
    (value: ValueType) => {
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
  if (addButton) {
    addButton.className = addButton.className ? `col-span-1 ${addButton.className}` : 'col-span-1';
  }

  return (
    <div
      data-testid={dataTestId ?? 'select-div'}
      className={addButton ? `grid grid-cols-7 grid-rows-1 ${className}` : `${className}`}
    >
      <Label name={label ?? ''} className={addButton ? 'whitespace-nowrap col-span-6' : 'whitespace-nowrap'}>
        <ReactSelect
          menuPosition={'fixed'}
          name={name}
          onChange={(val) => onChangeValue(val)}
          onBlur={(val) => onBlur(val)}
          options={memoOptions}
          onKeyDown={preventEnterKeyDefault ? onPreventEnterKeyDefault : undefined}
          value={defaultValue(memoOptions, value, isMulti)}
          isMulti={isMulti}
          placeholder={placeholder ?? ''}
          components={{ Option, IndicatorSeparator: () => null }}
          {...props}
          styles={{
            container: (css) => (fixedWidth ? { ...css, width: fixedWidth + 'px' } : { ...css }),
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
              minWidth: '100%',
              zIndex: 999
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
                height: label?.length === 0 ? '35px' : styles.height,
                padding: '2px 2px 8px 8px'
              };
            }
          }}
        />
      </Label>
      {addButton && (
        <AddButton data-testid={addButton.dataTestId} className={addButton.className} onClick={addButton.onClick} />
      )}
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
  preventEnterKeyDefault,
  ...props
}: CustomReactSelectProps) => {
  const { setFieldValue, setFieldTouched } = useFormikContext() ?? {};

  /**Reformat value field in case of number type value
   * If value is a number type, check whether one of the option 'value' field
   * contains that. If so, convert 'value' to string (as the option.value is always a string type)
   * and return , otherwise return an empty string
   */
  const memoNewValue = React.useMemo(() => {
    if (valueAsNumber) {
      if (options.find((option) => option.value === String(value))) {
        return value + '';
      } else return '';
    } else return value;
  }, [value, valueAsNumber, options]);

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
        value={memoNewValue}
        fixedWidth={fixedWidth}
        preventEnterKeyDefault={preventEnterKeyDefault}
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
