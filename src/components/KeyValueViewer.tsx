import React from "react";
import FormikSelect from "./forms/Select";
import FormikInput from "./forms/Input";

type KeyValueViewerProps = {
  keyValueMap: Map<string, string[]>;
  onChangeKey: (selectedKey: string) => void;
  onChangeValue: (selectedValue: string[]) => void;
  multiSelectValues?: boolean;
  keyLabel?: string;
  valueLabel?: string;
};

export const KeyValueViewer: React.FC<KeyValueViewerProps> = ({
  children,
  keyValueMap,
  onChangeKey,
  onChangeValue,
  multiSelectValues,
  keyLabel,
  valueLabel,
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const [selectedValue, setSelectedValue] = React.useState<string[]>([]);

  React.useEffect(() => {
    debugger;
    if (keyValueMap.size <= 0) return;
    setSelectedKey(Array.from(keyValueMap.keys())[0]);
    setSelectedValue([]);
  }, [keyValueMap]);

  const handleSelectKey = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
      onChangeKey(key);
    },
    [onChangeKey]
  );

  const handleSelectValue = React.useCallback(
    (value: string[]) => {
      setSelectedValue(value);
      onChangeValue(value);
    },
    [onChangeValue]
  );

  const getValues = (key: string): string[] => keyValueMap.get(key) ?? [];

  return (
    <div className="space-y-2 md:grid md:grid-cols-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-center md:gap-4">
      {Array.from(keyValueMap.keys()).length > 1 && (
        <div className="md:flex-grow">
          <FormikSelect
            label=""
            name="selectedType"
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
            name="selectedValue"
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
            name="selectedValue"
            data-testid={"valueSelect"}
            value={selectedValue ?? ""}
            emptyOption={true}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleSelectValue(
                Array.from(e.target.selectedOptions, (option) => option.value)
              );
            }}
            multi={multiSelectValues}
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
