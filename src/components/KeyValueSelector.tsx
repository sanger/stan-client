import React from "react";
import FormikSelect from "./forms/Select";
import FormikInput from "./forms/Input";

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
   */
  onChangeKey: (selectedKey: string) => void;
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
  schemaNameValue,
}) => {
  const getValues = React.useCallback(
    (key: string): string[] => {
      return keyValueMap.get(key) ?? [];
    },
    [keyValueMap]
  );

  const handleSelectKey = React.useCallback(
    (key: string) => {
      onChangeKey(key);
      let val: string[] = [];
      if (!multiSelectValues) {
        const values = getValues(key);
        val = values.length > 0 ? [values[0]] : [];
      }
      onChangeValue(val);
    },
    [onChangeKey, onChangeValue, multiSelectValues, getValues]
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
        <FormikSelect
          label={keyLabel ?? ""}
          name={schemaNameKey ?? ""}
          data-testid={"type"}
          value={selected.key}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            handleSelectKey(e.currentTarget.value);
          }}
        >
          {Array.from(keyValueMap.keys()).map((key: string) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </FormikSelect>
      </div>
      <div className="md:flex-grow">
        {selected.key && getValues(selected.key).length <= 0 ? (
          <FormikInput
            name={schemaNameValue ?? ""}
            label={valueLabel ?? ""}
            data-testid={"valueInput"}
            value={selected.value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleSelectValue([e.currentTarget.value]);
            }}
          />
        ) : (
          <FormikSelect
            label={valueLabel ?? ""}
            name={schemaNameValue ?? ""}
            data-testid={"valueSelect"}
            value={
              selected.value
                ? multiSelectValues
                  ? selected.value
                  : selected.value.length > 0
                  ? selected.value[0]
                  : ""
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleSelectValue(
                Array.from(e.target.selectedOptions, (option) => option.value)
              );
            }}
            multiple={multiSelectValues}
          >
            {getValues(selected.key).map((val: string) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </FormikSelect>
        )}
      </div>
    </div>
  );
};
