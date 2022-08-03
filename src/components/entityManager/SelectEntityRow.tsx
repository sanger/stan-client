import React from 'react';
import { TableCell } from '../Table';
import { Select } from '../forms/Select';

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
};

export function SelectEntityRow({ value, valueFieldOptions, onChange }: SelectEntityRowParams) {
  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.currentTarget.value);
  };

  return (
    <TableCell colSpan={2}>
      <Select onChange={handleOnChange} value={value}>
        {valueFieldOptions.map((option, indx) => (
          <option key={indx} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </TableCell>
  );
}
