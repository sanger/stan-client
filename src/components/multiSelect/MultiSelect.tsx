import React, { useState } from 'react';
import Pill from '../Pill';
import RemoveIcon from '../icons/RemoveIcon';

/**Select component that supports single and multiple selections**/

export type Option = {
  label: string;
  value: string;
  key?: string;
};

export type Position = 'TOP' | 'BOTTOM';
interface SelectProps
  extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  /**
   * Options to display in select
   */
  options: Option[];
  /**
   * Callback whenever selection changes
   * @param val All selected values
   * @param selectedIndex Index of the selection in display
   */
  notifySelection?: (val: string[], selectedIndex: number) => void;
  /**
   * Optional. If set, this value will be selected if that exist in option value
   */
  selectedValueProp?: string[];
  /**
   * Is Multiple selection or not, by default it is true
   */
  multiple?: boolean;
  /**
   * Position to display selected options - Top or bottom of select box
   */
  selectedOptionDisplayPosition?: Position;
}
const defaultClassNames =
  'block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 disabled:opacity-75 disabled:bg-gray-200 disabled:cursor-not-allowed';

export const MultiSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      options,
      multiple = true,
      selectedOptionDisplayPosition = 'TOP',
      selectedValueProp,
      notifySelection,
      ...props
    },
    ref
  ) => {
    const [selected, setSelected] = useState<Array<string>>([]);
    const [selectionIndex, setSelectionIndex] = useState(-1);

    React.useEffect(() => {
      //Update selection, only if the given selection is different from what already exists
      if (options.length === 0) return;
      if (!selectedValueProp) return;
      const givenSelectedValues = options
        .filter((option) => selectedValueProp?.includes(option.value))
        .map((option) => option.value);
      if (
        givenSelectedValues.length === selected.length &&
        givenSelectedValues.sort().toString() === selected.sort().toString()
      )
        return;
      setSelected(givenSelectedValues);
      setSelectionIndex(givenSelectedValues.length - 1);
    }, [selectedValueProp, setSelected, setSelectionIndex, options, selected]);

    /**Callback to handle selection changes**/
    const handleChange = React.useCallback(
      (selectedValue: string) => {
        /**Empty option selected, if this is multiple-select , keep all other selection, but only reset the display of selected value
         * otherwise for single-select, remove all selections
         ***/
        if (selectedValue === '') {
          setSelectionIndex(-1);
          notifySelection?.(multiple ? selected : [], -1);
        } else {
          //A new value is selected
          let newSelection = [selectedValue];
          let newSelectedIndex = 0;
          if (multiple) {
            newSelection = [...selected, selectedValue];
            newSelectedIndex = newSelection.length - 1;
          }
          setSelected(newSelection);
          setSelectionIndex(newSelectedIndex);
          notifySelection?.(newSelection, newSelectedIndex);
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

    const renderSelectedOptions = () => {
      return (
        <div className={'flex flex-row flex-wrap mb-2 border-gray-100 border-2 py-2 shadow-sm'}>
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
      );
    };
    return (
      <div className={'flex flex-col'}>
        {multiple &&
          selected.length > 0 &&
          selectedWithoutEmptyString.length > 0 &&
          selectedOptionDisplayPosition === 'TOP' &&
          renderSelectedOptions()}
        <select
          ref={ref}
          className={defaultClassNames}
          onChange={(e) => handleChange(e.currentTarget.value)}
          value={selectionIndex >= 0 ? selected[selectionIndex] : ''}
          {...props}
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
        {multiple &&
          selected.length > 0 &&
          selectedWithoutEmptyString.length > 0 &&
          selectedOptionDisplayPosition === 'BOTTOM' &&
          renderSelectedOptions()}
      </div>
    );
  }
);
