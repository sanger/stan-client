import React from "react";
import { TableCell } from "../Table";
import { Input } from "../forms/Input";

type BooleanEntityRowParams = {
  /**
   * The value to be displayed
   */
  value: boolean;

  /**
   * Should this row be disabled right now
   */
  disable: boolean;

  /**
   * Callback handler for when the checkbox changes value
   * @param entity the row entity
   * @param enabled true if the checkbox is checked, false otherwise
   */
  onChange: (enabled: boolean) => void;
};

export function BooleanEntityRow({
  value,
  disable,
  onChange,
}: BooleanEntityRowParams) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <TableCell colSpan={2}>
      <Input
        type="checkbox"
        disabled={disable}
        defaultChecked={value}
        onChange={handleOnChange}
      />
    </TableCell>
  );
}
