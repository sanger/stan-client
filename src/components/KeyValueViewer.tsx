import React from "react";
import FormikSelect from "./forms/Select";
import FormikInput from "./forms/Input";

type KeyValueViewerProps = {
  keyValueMap: Map<string, string[]>;
  onChangeKey: (selectedKey: string) => void;
  onChangeValue: (selectedValue: string[]) => void;
  initialKeyValue: { key: string; value: string[] };
  multiSelectValues?: boolean;
  emptyOption?: boolean;
  keyLabel?: string;
  valueLabel?: string;
  schemaNameKey?: string;
  schemaNameValue?: string;
};

export const KeyValueViewer: React.FC<KeyValueViewerProps> = ({
  keyValueMap,
  onChangeKey,
  onChangeValue,
  initialKeyValue,
  multiSelectValues,
  keyLabel,
  valueLabel,
  schemaNameKey,
  schemaNameValue,
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string>(
    initialKeyValue.key
  );
  const [selectedValue, setSelectedValue] = React.useState<string[]>(
    initialKeyValue.value
  );
  debugger;
  /**Initialize on changes in input data**/
  /*React.useEffect(() => {
    if (keyValueMap.size <= 0) {
      return;
    }
    const key = Array.from(keyValueMap.keys())[0];
    setSelectedKey(key);
    onChangeKey(key);
    setSelectedValue([]);
    onChangeValue([]);
  }, [
    keyValueMap,
    setSelectedKey,
    setSelectedValue,
    onChangeKey,
    onChangeValue,
  ]);*/

  const getValues = React.useCallback(
    (key: string): string[] => {
      return keyValueMap.get(key) ?? [];
    },
    [keyValueMap]
  );

  const handleSelectKey = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
      onChangeKey(key);
      let val: string[] = [];
      if (!multiSelectValues) {
        const values = getValues(key);
        val = values.length > 0 ? [values[0]] : [];
      }
      setSelectedValue(val);
      onChangeValue(val);
    },
    [onChangeKey, onChangeValue, setSelectedValue, multiSelectValues, getValues]
  );

  const handleSelectValue = React.useCallback(
    (value: string[]) => {
      setSelectedValue(value);
      onChangeValue(value);
    },
    [onChangeValue]
  );
  return (
    <div className="space-y-2 md:grid md:grid-cols-2 md:px-10 md:space-y-0 md:flex md:flex-row md:flex-grow  md:justify-center md:items-center md:gap-4">
      {Array.from(keyValueMap.keys()).length > 1 && (
        <div className="md:flex-grow">
          <FormikSelect
            label={keyLabel ?? ""}
            name={schemaNameKey ?? ""}
            data-testid={"type"}
            value={selectedKey}
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
      )}
      <div className="md:flex-grow">
        {selectedKey && getValues(selectedKey).length <= 0 ? (
          <FormikInput
            name={schemaNameValue ?? ""}
            label={valueLabel ?? ""}
            data-testid={"valueInput"}
            value={selectedValue}
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
              selectedValue
                ? multiSelectValues
                  ? selectedValue
                  : selectedValue.length > 0
                  ? selectedValue[0]
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
            {getValues(selectedKey).map((val: string) => (
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
