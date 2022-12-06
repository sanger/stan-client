import React, { useState } from 'react';
import Pill from '../Pill';
import RemoveIcon from '../icons/RemoveIcon';

export type Option = {
  label: string;
  value: string;
  key?: string;
};
interface SelectProps
  extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  options: Option[];
  notifySelection?: (val: string[]) => void;
  multiple?: boolean;
}
const defaultClassNames =
  'block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

export const MultiSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, options, multiple = true, notifySelection, ...props }, ref) => {
    const [selected, setSelected] = useState<Array<string>>([]);

    const handleChange = React.useCallback(
      (selectedValue: string) => {
        let newSelection = [...selected, selectedValue];
        if (!multiple) {
          newSelection = [selectedValue];
        }
        setSelected(newSelection);
        notifySelection?.(newSelection);
      },
      [multiple, setSelected, notifySelection, selected]
    );

    const handleRemove = React.useCallback(
      (removedValue: string) => {
        let newSelection = selected.filter((val) => val !== removedValue);
        setSelected(newSelection);
        notifySelection?.(newSelection);
      },
      [setSelected, notifySelection, selected]
    );

    return (
      <div className={'flex flex-col'}>
        {multiple && selected.length > 0 && (
          <div className={'flex flex-row space-x-1 mb-2'}>
            {selected.map((selected) => {
              return (
                <div className={'flex flex-row whitespace-nowrap'}>
                  <Pill color={'blue'}>
                    <div className={'flex flex-row space-x-2 p-1 items-center'}>
                      <div data-testid={'caption'}>{selected}</div>
                      <button
                        data-testid="removeButton"
                        className=" hover:bg-red-100 rounded-md focus:outline-none bg-white focus:bg-red-100 text-sdb-400 hover:text-red-600 disabled:text-gray-200"
                        onClick={() => {
                          handleRemove(selected);
                        }}
                      >
                        <RemoveIcon className="block h-4 w-4" />
                      </button>
                    </div>
                  </Pill>
                </div>
              );
            })}
          </div>
        )}
        <select
          ref={ref}
          className={defaultClassNames}
          {...props}
          onChange={(e) => handleChange(e.currentTarget.value)}
          value={selected.length > 0 ? selected[selected.length - 1] : ''}
        >
          {<option value="" />}
          {options.map((option, index) => (
            <option
              key={option.key ? option.key : index}
              value={option.value}
              disabled={multiple ? selected.includes(option.value) : false}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
