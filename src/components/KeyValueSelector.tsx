import React from 'react';
import FormikInput from './forms/Input';
import CustomReactSelect, { OptionType } from './forms/CustomReactSelect';

type KeyValueViewerProps = {
  /**
   * Key-Value data
   **/
  keyValueMap: Map<string, string[]>;
  /**
   * Selected key-value data, if any
   */
  selected: { key: string; value: string[] };
  /**
   * Callback on changing selected key change
   * @param selectedKey - newly selected key
   * @param selectedValues - values for the selected key
   */
  onChangeKey: (selectedKey: string, values: string[]) => void;
  /**
   * Call back on selected value change
   * @param selectedValue - newly selected value
   */
  onChangeValue: (selectedValue: string[]) => void;
  /**
   * Enables multiple selection of values
   */
  multiSelectValues?: boolean;
  /**
   * Label to display for 'key' field
   */
  keyLabel?: string;
  /**
   * Label to display for value
   */
  valueLabel?: string;
  /**
   * Schema name to be used for key field. This can be used if external validation is required using Yup
   */
  schemaNameKey?: string;
  /**
   * Schema name to be used for value field. This can be used if external validation is required using Yup
   */
  schemaNameValue?: string;
};

/***
 * This displays a map with Key-Value pairs with following controls
 * 1) Dropdown to select the key,
 * 2) Dropdown to select values if there are more than one value or a TextField otherwise
 * This returns callbacks to parent, whenever a new key and value is selected
 */
export const KeyValueSelector: React.FC<KeyValueViewerProps> = ({
  keyValueMap,
  onChangeKey,
  onChangeValue,
  selected,
  multiSelectValues,
  keyLabel,
  valueLabel,
  schemaNameKey,
  schemaNameValue
}) => {
  const getValues = React.useCallback(
    (key: string): string[] => {
      return keyValueMap.get(key) ?? [];
    },
    [keyValueMap]
  );

  const handleSelectKey = React.useCallback(
    (key: string) => {
      let val: string[] = [];
      if (!multiSelectValues) {
        const values = getValues(key);
        val = values.length > 0 ? [values[0]] : [];
      }
      onChangeKey(key, val);
    },
    [onChangeKey, multiSelectValues, getValues]
  );

  const handleSelectValue = React.useCallback(
    (value: string[]) => {
      onChangeValue(value);
    },
    [onChangeValue]
  );
  return (
    <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:flex-grow  md:justify-center md:items-center md:gap-4">
      <div className="md:flex-grow">
        <CustomReactSelect
          label={keyLabel ?? ''}
          name={schemaNameKey ?? ''}
          dataTestId={'type'}
          value={selected.key}
          handleChange={(val) => {
            handleSelectKey((val as OptionType).label);
          }}
          options={Array.from(keyValueMap.keys())
            .sort()
            .map((key: string) => {
              return { label: key, value: key };
            })}
        />
      </div>
      <div className="md:flex-grow">
        {selected.key && getValues(selected.key).length <= 0 ? (
          <FormikInput
            name={schemaNameValue ?? ''}
            label={valueLabel ?? ''}
            data-testid={'valueInput'}
            value={selected.value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleSelectValue([e.currentTarget.value]);
            }}
          />
        ) : (
          <CustomReactSelect
            label={valueLabel ?? ''}
            name={schemaNameValue ?? ''}
            dataTestId={'valueSelect'}
            value={
              selected.value
                ? multiSelectValues
                  ? selected.value
                  : selected.value.length > 0
                  ? selected.value[0]
                  : ''
                : ''
            }
            handleChange={(val) => {
              if (Array.isArray(val)) {
                handleSelectValue(Array.from(val, (option) => option.value));
              } else {
                handleSelectValue([]);
              }
            }}
            isMulti={multiSelectValues}
            options={getValues(selected.key).map((val: string) => {
              return { value: val, label: val };
            })}
          />
        )}
      </div>
    </div>
  );
};
