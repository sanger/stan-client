import React from 'react';
import { TableCell } from '../Table';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

type SelectEntityRowParams = {
  /**
   * The value of the field of the entity displayed in row
   */
  value: string;

  /**
   *Options for Select entity
   */
  valueFieldOptions: string[];

  /**
   * Callback handler for when the dropbox changes value
   * @param entity the row entity
   * @param selected value in dropbox
   */
  onChange: (value: string) => void;
  dataTestId: string;
};

export function SelectEntityRow({ value, valueFieldOptions, onChange, dataTestId }: SelectEntityRowParams) {
  const handleOnChange = (value: OptionType | OptionType[]) => {
    onChange((value as OptionType).value);
  };

  return (
    <TableCell colSpan={2}>
      <CustomReactSelect
        handleChange={handleOnChange}
        value={value}
        dataTestId={dataTestId}
        emptyOption
        options={valueFieldOptions.map((option) => {
          return {
            value: option,
            label: option
          };
        })}
      />
    </TableCell>
  );
}
