import React from 'react';
import BarcodeIcon from '../icons/BarcodeIcon';
import LockIcon from '../icons/LockIcon';
import classNames from 'classnames';

interface ScanInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  /**
   * Callback for when a barcode is scanned into the {@link ScanInput}
   * @param value the current value of the input
   */
  onScan?: (value: string) => void;
  /**
   * Allow empty value in input, so it can be validated from parent component
   */
  allowEmptyValue?: boolean;
}

/**
 * Input that will call the onScan callback on both `tab` or `enter` (one of which hopefully is what a barcode scanner has setup as its terminal character).
 */
const ScanInput = React.forwardRef<HTMLInputElement, ScanInputProps>(
  ({ onScan, allowEmptyValue = false, ...inputProps }, ref) => {
    const inputClassNames = classNames(
      {
        'rounded-r-md': !inputProps?.disabled,
        'border-r-0 disabled:bg-gray-100': inputProps?.disabled
      },
      'flex-grow-0 focus:ring-sdb-100 focus:border-sdb-100 h-10 block w-full border-gray-300 rounded-none transition duration-150 ease-in-out'
    );

    const onKeyDownHandler = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Tab', 'Enter'].some((triggerKey) => triggerKey === e.key)) {
          e.preventDefault();
          if (e.currentTarget.value === '' && !allowEmptyValue) {
            return;
          }
          onScan?.(e.currentTarget.value);
        }
      },
      [onScan, allowEmptyValue]
    );

    return (
      <div className="flex rounded-md shadow-sm">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          <BarcodeIcon className="block h-5 w-5" />
        </span>
        <input {...inputProps} ref={ref} type="text" onKeyDown={onKeyDownHandler} className={inputClassNames} />
        {inputProps?.disabled && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 transition duration-150 ease-in-out text-sm">
            <LockIcon className="block h-5 w-5 text-sp-300 transition duration-150 ease-in-out" />
          </span>
        )}
      </div>
    );
  }
);

export default ScanInput;
