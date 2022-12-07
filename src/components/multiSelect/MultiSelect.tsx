import React, { useState } from 'react';
import Pill from '../Pill';
import RemoveIcon from '../icons/RemoveIcon';

/**Select component that supports single and multiple selections**/

export type Option = {
  label: string;
  value: string;
  key?: string;
};
interface SelectProps
  extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  options: Option[];
  notifySelection?: (val: string[], selectedIndex: number) => void;
  initialSelectedValue?: string[];
  multiple?: boolean;
}
const defaultClassNames =
  'block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

export const MultiSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, options, multiple = true, initialSelectedValue, notifySelection, ...props }, ref) => {
    const selectedValues = options
      .filter((option) => initialSelectedValue?.some((value) => value === option.value))
      .map((option) => option.value);

    const [selected, setSelected] = useState<Array<string>>(selectedValues);
    const [selectionIndex, setSelectionIndex] = useState(selectedValues.length > 0 ? selectedValues.length - 1 : -1);

    /**Callback to handle selection changes**/
    const handleChange = React.useCallback(
      (selectedValue: string) => {
        if (selectedValue === '') {
          setSelectionIndex(-1);
          notifySelection?.(selected, -1);
        } else {
          let newSelection = [...selected, selectedValue];
          if (!multiple) {
            newSelection = [selectedValue];
          }
          setSelected(newSelection);
          notifySelection?.(newSelection, newSelection.length - 1);
          setSelectionIndex(newSelection.length - 1);
        }
      },
      [multiple, setSelected, notifySelection, selected, setSelectionIndex]
    );

    /**Callback to handle remove selection**/
    const handleRemove = React.useCallback(
      (removedValue: string) => {
        const removedIndex = selected.findIndex((val) => val === removedValue);
        if (removedIndex >= 0) {
          const updatedSelection = selected.filter((val) => val !== removedValue);
          setSelected(updatedSelection);
          setSelectionIndex(removedIndex - 1);
          notifySelection?.(updatedSelection, removedIndex - 1);
        }
      },
      [setSelected, notifySelection, selected, setSelectionIndex]
    );

    const handleSelectionChange = React.useCallback(
      (selectedIndex: number) => {
        setSelectionIndex(selectedIndex);
        notifySelection?.(selected, selectedIndex);
      },
      [notifySelection, selected, setSelectionIndex]
    );

    const selectedWithoutEmptyString = selected.filter((item) => item !== '');

    return (
      <div className={'flex flex-col'}>
        {multiple && selected.length > 0 && selectedWithoutEmptyString.length > 0 && (
          <div className={'flex flex-row flex-wrap mb-2 border-gray-100 border-2 p-2 shadow-sm'}>
            {selectedWithoutEmptyString.map((selectedStr, index) => {
              return (
                <div className={'flex flex-row whitespace-nowrap mr-2 mb-1'} key={index}>
                  <Pill
                    color={'blue'}
                    className={`hover:bg-blue-600 cursor-pointer  ${selectionIndex === index ? 'text-sp-300' : ''} `}
                  >
                    <div className={'flex flex-row gap-x-2 p-1 items-center'}>
                      <div data-testid={'caption'} onClick={() => handleSelectionChange(index)}>
                        {selectedStr}
                      </div>
                      <button
                        data-testid="removeButton"
                        className=" hover:bg-red-100 rounded-md focus:outline-none bg-white focus:bg-red-100 text-sdb-400 hover:text-red-600 disabled:text-gray-200"
                        onClick={() => {
                          handleRemove(selectedStr);
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
          value={selectionIndex >= 0 ? selected[selectionIndex] : ''}
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
